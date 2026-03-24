import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;

  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // File Upload
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: number;
  ALLOWED_IMAGE_TYPES: string;
  ALLOWED_DOC_TYPES: string;

  // AWS S3 (optional)
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;

  // Cloudinary (optional)
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;

  // Email
  EMAIL_PROVIDER: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  FROM_EMAIL: string;
  FROM_NAME: string;

  // Payment
  PAYMENT_GATEWAY: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;

  // Frontend
  FRONTEND_URL: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Logging
  LOG_LEVEL: string;
  LOG_FILE: string;

  // Company Details
  COMPANY_NAME: string;
  COMPANY_GSTIN?: string;
  COMPANY_PAN?: string;
  COMPANY_ADDRESS?: string;
  COMPANY_CITY?: string;
  COMPANY_STATE?: string;
  COMPANY_PINCODE?: string;
  COMPANY_PHONE?: string;
  COMPANY_EMAIL: string;
}

function validateEnv(): EnvConfig {
  // If DATABASE_URL is provided (Render), individual DB vars are not required
  const hasDatabaseUrl = !!process.env.DATABASE_URL;

  const requiredVars = [
    ...(hasDatabaseUrl ? [] : ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']),
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Warn about optional SMTP config (email features won't work without it)
  const smtpVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'FROM_EMAIL'];
  const missingSMTP = smtpVars.filter((v) => !process.env[v]);
  if (missingSMTP.length > 0) {
    console.warn(`⚠️  Missing SMTP env vars (${missingSMTP.join(', ')}). Email features will be disabled.`);
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (
    process.env.JWT_REFRESH_SECRET &&
    process.env.JWT_REFRESH_SECRET.length < 32
  ) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    API_VERSION: process.env.API_VERSION || 'v1',

    DB_HOST: process.env.DB_HOST!,
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_NAME: process.env.DB_NAME!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,

    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    ALLOWED_IMAGE_TYPES:
      process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp',
    ALLOWED_DOC_TYPES:
      process.env.ALLOWED_DOC_TYPES || 'application/pdf,image/jpeg,image/png',

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'smtp',
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
    FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@eflora.com',
    FROM_NAME: process.env.FROM_NAME || 'eFlora',

    PAYMENT_GATEWAY: process.env.PAYMENT_GATEWAY || 'razorpay',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,

    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    RATE_LIMIT_WINDOW_MS: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || '900000',
      10
    ),
    RATE_LIMIT_MAX_REQUESTS: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || '500',
      10
    ),

    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE: process.env.LOG_FILE || 'logs/app.log',

    COMPANY_NAME: process.env.COMPANY_NAME || 'eFlora Marketplace',
    COMPANY_GSTIN: process.env.COMPANY_GSTIN,
    COMPANY_PAN: process.env.COMPANY_PAN,
    COMPANY_ADDRESS: process.env.COMPANY_ADDRESS,
    COMPANY_CITY: process.env.COMPANY_CITY,
    COMPANY_STATE: process.env.COMPANY_STATE,
    COMPANY_PINCODE: process.env.COMPANY_PINCODE,
    COMPANY_PHONE: process.env.COMPANY_PHONE,
    COMPANY_EMAIL: process.env.COMPANY_EMAIL || 'support@eflora.com',
  };
}

export const env = validateEnv();
export default env;
