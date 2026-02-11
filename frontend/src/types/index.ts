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

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

// Product Types
export enum ProductModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Product {
  id: string;
  supplier_id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: number;
  mrp?: number;
  gst_percentage: number;
  stock_quantity: number;
  min_order_quantity: number;
  images?: string[];
  specifications?: any;
  care_instructions?: string;
  moderation_status: ProductModerationStatus;
  is_active: boolean;
  rejection_reason?: string;
  moderated_by?: string;
  moderated_at?: string;
  created_at: string;
  updated_at: string;
  // From joins
  supplier?: Supplier;
  category?: Category;
}

export interface ProductFormData {
  category_id: string;
  name: string;
  description?: string;
  price: number;
  mrp?: number;
  gst_percentage: number;
  stock_quantity: number;
  min_order_quantity: number;
  specifications?: any;
  care_instructions?: string;
}

// Inventory Types
export enum InventoryChangeType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  DAMAGED = 'damaged',
}

export interface InventoryLog {
  id: string;
  product_id: string;
  change_type: InventoryChangeType;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  // From joins
  product_name?: string;
  sku?: string;
}

export interface InventoryStats {
  total_products: number;
  total_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
  avg_stock: number;
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
