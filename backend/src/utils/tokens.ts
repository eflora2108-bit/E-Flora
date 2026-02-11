import crypto from 'crypto';

// Generate random token (for email verification, password reset, etc.)
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate expiry date (from now + hours)
export const generateExpiryDate = (hours: number): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};

// Check if token is expired
export const isTokenExpired = (expiryDate: Date): boolean => {
  return new Date() > new Date(expiryDate);
};
