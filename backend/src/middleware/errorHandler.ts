import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import env from '../config/env';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Determine status code
  const statusCode =
    (err as AppError).statusCode || 500;

  // Determine if error is operational
  const isOperational =
    (err as AppError).isOperational || false;

  // Send error response
  const errorResponse: any = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Include additional details for operational errors
  if (isOperational) {
    res.status(statusCode).json(errorResponse);
  } else {
    // For non-operational errors, send generic message
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

// 404 Not Found handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
