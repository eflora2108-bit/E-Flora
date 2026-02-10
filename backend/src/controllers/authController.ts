import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import logger from '../utils/logger';

export class AuthController {
  // POST /api/v1/auth/register - Register new user
  static register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, role, first_name, last_name, phone } = req.body;

      // Validate required fields
      if (!email || !password || !role || !first_name || !last_name) {
        throw new AppError(
          'Email, password, role, first name, and last name are required',
          400
        );
      }

      // Validate role
      if (!Object.values(UserRole).includes(role)) {
        throw new AppError('Invalid role', 400);
      }

      // Prevent direct admin registration
      if (role === UserRole.ADMIN) {
        throw new AppError('Cannot register as admin', 403);
      }

      const result = await AuthService.register({
        email,
        password,
        role,
        first_name,
        last_name,
        phone,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    }
  );

  // POST /api/v1/auth/login - Login user
  static login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    }
  );

  // POST /api/v1/auth/verify-email - Verify email with token
  static verifyEmail = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token } = req.body;

      if (!token) {
        throw new AppError('Verification token is required', 400);
      }

      await AuthService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    }
  );

  // POST /api/v1/auth/resend-verification - Resend verification email
  static resendVerification = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Email is required', 400);
      }

      await AuthService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: 'Verification email sent',
      });
    }
  );

  // POST /api/v1/auth/forgot-password - Request password reset
  static forgotPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Email is required', 400);
      }

      await AuthService.requestPasswordReset(email);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    }
  );

  // POST /api/v1/auth/reset-password - Reset password with token
  static resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new AppError('Token and new password are required', 400);
      }

      await AuthService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successful',
      });
    }
  );

  // POST /api/v1/auth/change-password - Change password (authenticated)
  static changePassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      if (!currentPassword || !newPassword) {
        throw new AppError('Current and new password are required', 400);
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    }
  );

  // POST /api/v1/auth/refresh - Refresh access token
  static refreshToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    }
  );

  // GET /api/v1/auth/me - Get current user profile
  static getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;

      // Import UserModel here to avoid circular dependencies
      const { UserModel } = await import('../models/User');
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: UserModel.toPublic(user),
      });
    }
  );

  // POST /api/v1/auth/logout - Logout (client-side only, server doesn't maintain session)
  static logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // With JWT, logout is handled client-side by removing tokens
      // Server doesn't maintain session state
      // Could implement token blacklisting here if needed

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    }
  );
}
