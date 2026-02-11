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

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryCreateInput {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  display_order?: number;
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
  description?: string;
  short_description?: string;
  botanical_name?: string;
  sku: string;
  price: number;
  mrp?: number;
  gst_percentage: number;
  hsn_code?: string;
  unit: string;
  minimum_order_quantity: number;
  stock_quantity: number;
  low_stock_threshold: number;
  images?: any; // JSONB
  specifications?: any; // JSONB
  moderation_status: ProductModerationStatus;
  rejection_reason?: string;
  is_active: boolean;
  is_featured: boolean;
  moderated_by?: string;
  moderated_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ProductCreateInput {
  supplier_id: string;
  category_id: string;
  name: string;
  description?: string;
  short_description?: string;
  botanical_name?: string;
  price: number;
  mrp?: number;
  gst_percentage?: number;
  hsn_code?: string;
  unit?: string;
  minimum_order_quantity?: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  specifications?: any;
}

export interface ProductUpdateInput {
  category_id?: string;
  name?: string;
  description?: string;
  short_description?: string;
  botanical_name?: string;
  price?: number;
  mrp?: number;
  gst_percentage?: number;
  hsn_code?: string;
  unit?: string;
  minimum_order_quantity?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  specifications?: any;
}

// Express Request with User
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
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
  created_at: Date;
}

export interface InventoryLogCreateInput {
  product_id: string;
  change_type: InventoryChangeType;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItemCreateInput {
  user_id: string;
  product_id: string;
  quantity: number;
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
  created_at: Date;
  updated_at: Date;
}

export interface AddressCreateInput {
  user_id: string;
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

export interface AddressUpdateInput {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
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
  razorpay_signature?: string;
  subtotal: number;
  gst_amount: number;
  shipping_charges: number;
  total_amount: number;
  shipping_address_id: string;
  billing_address_id?: string;
  notes?: string;
  tracking_number?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
}

export interface OrderCreateInput {
  user_id: string;
  shipping_address_id: string;
  billing_address_id?: string;
  notes?: string;
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
  generated_at?: Date;
  sent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceCreateInput {
  order_id: string;
  user_id: string;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst: number;
  shipping_charges: number;
  total_amount: number;
}

export interface GSTCalculation {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  isInterState: boolean;
}

// Review Types
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  title?: string;
  comment?: string;
  status: ReviewStatus;
  helpful_count: number;
  verified_purchase: boolean;
  moderated_by?: string;
  moderated_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewCreateInput {
  product_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewUpdateInput {
  rating?: number;
  title?: string;
  comment?: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  notify_on_stock: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WishlistItemCreateInput {
  user_id: string;
  product_id: string;
  notify_on_stock?: boolean;
}

// Notification Types
export enum NotificationType {
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  PRODUCT_APPROVED = 'product_approved',
  PRODUCT_REJECTED = 'product_rejected',
  SUPPLIER_APPROVED = 'supplier_approved',
  SUPPLIER_REJECTED = 'supplier_rejected',
  LOW_STOCK = 'low_stock',
  WISHLIST_STOCK = 'wishlist_stock',
  REVIEW_APPROVED = 'review_approved',
  REVIEW_REJECTED = 'review_rejected',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: Date;
}

export interface NotificationCreateInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
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
