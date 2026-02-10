// User Types
export enum UserRole {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  agreeToTerms: boolean;
}

// Product Types (for future use)
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp?: number;
  images: string[];
  short_description?: string;
  stock_quantity: number;
  category_id: string;
  supplier_id: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
}

// Order Types
export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
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
  verification_documents?: any;
  rejection_reason?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  // From join with users table
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface SupplierProfileData {
  business_name: string;
  business_type?: string;
  gstin?: string;
  pan?: string;
  business_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}
