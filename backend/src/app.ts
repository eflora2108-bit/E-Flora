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
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import cartRoutes from './routes/cartRoutes';
import addressRoutes from './routes/addressRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import reviewRoutes from './routes/reviewRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Create Express app
const app: Application = express();

// CORS - allow all origins in production for now, restrict later
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight explicitly
app.options('*', cors());

// Security middleware - configured for cross-origin API usage
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
}));

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
app.use(`/api/${env.API_VERSION}/categories`, categoryRoutes);
app.use(`/api/${env.API_VERSION}/products`, productRoutes);
app.use(`/api/${env.API_VERSION}/inventory`, inventoryRoutes);
app.use(`/api/${env.API_VERSION}/cart`, cartRoutes);
app.use(`/api/${env.API_VERSION}/addresses`, addressRoutes);
app.use(`/api/${env.API_VERSION}/checkout`, checkoutRoutes);
app.use(`/api/${env.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${env.API_VERSION}/orders`, orderRoutes);
app.use(`/api/${env.API_VERSION}/invoices`, invoiceRoutes);
app.use(`/api/${env.API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${env.API_VERSION}/wishlist`, wishlistRoutes);
app.use(`/api/${env.API_VERSION}/notifications`, notificationRoutes);

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
