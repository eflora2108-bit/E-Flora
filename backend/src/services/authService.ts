import { UserModel } from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { generateRandomToken, generateExpiryDate } from '../utils/tokens';
import { isValidEmail } from '../utils/validators';
import { AppError } from '../middleware/errorHandler';
import { UserCreateInput, AuthTokens, JWTPayload, UserRole } from '../types';
import logger from '../utils/logger';

export class AuthService {
  // Register a new user
  static async register(data: UserCreateInput): Promise<{
    user: any;
    tokens: AuthTokens;
  }> {
    // Validate email
    if (!isValidEmail(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new AppError(
        passwordValidation.errors.join(', '),
        400
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await UserModel.create({
      ...data,
      password: passwordHash,
    });

    // Generate email verification token
    const verificationToken = generateRandomToken();
    const verificationExpiry = generateExpiryDate(24); // 24 hours

    await UserModel.setEmailVerificationToken(
      user.id,
      verificationToken,
      verificationExpiry
    );

    // TODO: Send verification email
    logger.info(`Email verification token for ${user.email}: ${verificationToken}`);

    // Generate JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: UserModel.toPublic(user),
      tokens,
    };
  }

  // Login user
  static async login(
    email: string,
    password: string
  ): Promise<{
    user: any;
    tokens: AuthTokens;
  }> {
    // Validate email
    if (!isValidEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError('Account is deactivated. Please contact support.', 403);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: UserModel.toPublic(user),
      tokens,
    };
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    const user = await UserModel.findByEmailVerificationToken(token);

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await UserModel.verifyEmail(user.id);

    logger.info(`Email verified: ${user.email}`);
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetExpiry = generateExpiryDate(1); // 1 hour

    await UserModel.setPasswordResetToken(user.id, resetToken, resetExpiry);

    // TODO: Send password reset email
    logger.info(`Password reset token for ${user.email}: ${resetToken}`);
  }

  // Reset password
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(
        passwordValidation.errors.join(', '),
        400
      );
    }

    const user = await UserModel.findByPasswordResetToken(token);

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await UserModel.updatePassword(user.id, passwordHash);

    logger.info(`Password reset successful for: ${user.email}`);
  }

  // Refresh access token
  static async refreshAccessToken(
    refreshToken: string
  ): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await UserModel.findById(payload.userId);
      if (!user || !user.is_active) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  // Change password (authenticated user)
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(
        passwordValidation.errors.join(', '),
        400
      );
    }

    // Check if new password is same as current
    const isSamePassword = await comparePassword(newPassword, user.password_hash);
    if (isSamePassword) {
      throw new AppError('New password must be different from current password', 400);
    }

    // Hash and update password
    const passwordHash = await hashPassword(newPassword);
    await UserModel.updatePassword(user.id, passwordHash);

    logger.info(`Password changed for: ${user.email}`);
  }

  // Resend verification email
  static async resendVerificationEmail(email: string): Promise<void> {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.email_verified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new verification token
    const verificationToken = generateRandomToken();
    const verificationExpiry = generateExpiryDate(24);

    await UserModel.setEmailVerificationToken(
      user.id,
      verificationToken,
      verificationExpiry
    );

    // TODO: Send verification email
    logger.info(`Verification email resent to: ${user.email}, token: ${verificationToken}`);
  }
}
