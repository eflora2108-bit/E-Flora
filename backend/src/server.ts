import app from './app';
import env from './config/env';
import logger from './utils/logger';
import { healthCheck, closePool } from './config/database';

const PORT = env.PORT || 5000;

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`🚀 Server started on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 API URL: http://localhost:${PORT}`);
  logger.info(`📚 API Version: ${env.API_VERSION}`);

  // Check database connection
  const dbHealthy = await healthCheck();
  if (dbHealthy) {
    logger.info('✅ Database connection established');
  } else {
    logger.warn('⚠️ Database connection failed - server running but DB features may not work');
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Close HTTP server
  server.close(async () => {
    logger.info('🔌 HTTP server closed');

    // Close database pool
    await closePool();

    logger.info('👋 Process terminated gracefully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('⚠️ Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
