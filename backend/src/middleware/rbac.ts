import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { UserRole } from '../types';

// Middleware to check if user has required role
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

// Check if user is admin
export const requireAdmin = requireRole([UserRole.ADMIN]);

// Check if user is supplier
export const requireSupplier = requireRole([UserRole.SUPPLIER]);

// Check if user is customer
export const requireCustomer = requireRole([UserRole.CUSTOMER]);

// Check if user is supplier or admin
export const requireSupplierOrAdmin = requireRole([
  UserRole.SUPPLIER,
  UserRole.ADMIN,
]);

// Middleware to check resource ownership (for suppliers)
export const checkResourceOwnership = (resourceIdParam: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Admin can access any resource
      if (req.user?.role === UserRole.ADMIN) {
        return next();
      }

      // For suppliers, check if they own the resource
      if (req.user?.role === UserRole.SUPPLIER) {
        const resourceId = req.params[resourceIdParam];
        const userId = req.user.userId;

        // Resource ownership validation logic goes here
        // For now, just pass through - will be implemented in specific controllers
        return next();
      }

      // Others cannot access
      return next(
        new AppError('You do not have permission to access this resource', 403)
      );
    } catch (error) {
      next(error);
    }
  };
};

// Check if email is verified
export const requireEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This would require checking the database
  // For now, we'll implement it at the service level
  // This is a placeholder for future use
  next();
};
