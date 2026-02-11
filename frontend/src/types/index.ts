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
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // From joins
  name?: string;
  slug?: string;
  sku?: string;
  price?: number;
  mrp?: number;
  gst_percentage?: number;
  stock_quantity?: number;
  minimum_order_quantity?: number;
  images?: string[];
  supplier_id?: string;
  supplier_name?: string;
  category_name?: string;
  is_active?: boolean;
  // Calculated fields
  item_total?: number;
  gst_amount?: number;
  total_with_gst?: number;
}

export interface CartSummary {
  subtotal: number;
  total_gst: number;
  total: number;
  total_items: number;
  item_count: number;
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
}

// Address Types
export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}

export interface Address {
  id: string;
  user_id: string;
  address_type: AddressType;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  address_type: AddressType;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

// Order Types
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  subtotal: number;
  gst_amount: number;
  shipping_charges: number;
  total_amount: number;
  shipping_address_id: string;
  billing_address_id?: string;
  notes?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  supplier_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  gst_percentage: number;
  gst_amount: number;
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

// Invoice Types
export enum InvoiceStatus {
  DRAFT = 'draft',
  GENERATED = 'generated',
  SENT = 'sent',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  user_id: string;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst: number;
  shipping_charges: number;
  total_amount: number;
  pdf_url?: string;
  status: InvoiceStatus;
  generated_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}
