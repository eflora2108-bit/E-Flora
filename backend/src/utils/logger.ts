import winston from 'winston';
import path from 'path';
import env from '../config/env';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDir = path.dirname(env.LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'eflora-backend' },
  transports: [
    // Write all logs to file
    new winston.transports.File({
      filename: env.LOG_FILE,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write errors to separate file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Always add console transport (needed for Render/Docker log visibility)
logger.add(
  new winston.transports.Console({
    format: env.NODE_ENV === 'production' ? logFormat : consoleFormat,
  })
);

export default logger;
