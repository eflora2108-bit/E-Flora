// User Types
export enum UserRole {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface UserUpdateInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export interface UserPublic {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Supplier Types
export enum SupplierVerificationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Supplier {
  id: string;
  user_id: string;
  business_name: string;
  business_type?: string;
  gstin?: string;
  pan?: string;
  business_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  verification_status: SupplierVerificationStatus;
  verification_documents?: any; // JSONB
  rejection_reason?: string;
  verified_at?: Date;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SupplierCreateInput {
  user_id: string;
  business_name: string;
  business_type?: string;
  gstin?: string;
  pan?: string;
  business_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface SupplierUpdateInput {
  business_name?: string;
  business_type?: string;
  gstin?: string;
  pan?: string;
  business_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// Express Request with User
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
