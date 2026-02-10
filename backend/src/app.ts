import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import env from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import authRoutes from './routes/authRoutes';
import supplierRoutes from './routes/supplierRoutes';
import adminRoutes from './routes/adminRoutes';

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/suppliers`, supplierRoutes);
app.use(`/api/${env.API_VERSION}/admin`, adminRoutes);
// app.use(`/api/${env.API_VERSION}/products`, productRoutes);
// etc.

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'eFlora API Server',
    version: env.API_VERSION,
    documentation: '/api-docs',
  });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
