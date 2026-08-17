export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: Partial<OrderItemInsert>;
      };
      coupons: {
        Row: CouponRow;
        Insert: CouponInsert;
        Update: Partial<CouponInsert>;
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: Partial<ReviewInsert>;
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: AdminUserInsert;
        Update: Partial<AdminUserInsert>;
      };
    };
  };
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  images: Json;
  variants: Json;
  sizes: Json;
  specs: Json;
  tags: Json;
  rating: number;
  review_count: number;
  stock: number;
  shipping_info: string;
  return_policy: string;
  featured: boolean;
  is_new: boolean;
  best_seller: boolean;
  limited_edition: boolean;
  summer_collection: boolean;
  hidden: boolean;
  sale_enabled: boolean;
  sale_ends_at: string | null;
  created_at: string;
}

export type ProductInsert = Omit<ProductRow, 'created_at'>;

export interface OrderRow {
  id: string;
  order_id: string;
  txn_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  notes: string | null;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grand_total: number;
  coupon_code: string | null;
  order_status: string;
  payment_status: string;
  pg_txn_id: string | null;
  pg_status: string | null;
  pg_error: string | null;
  placed_at: string;
  customer_id: string | null;
}

export type OrderInsert = Omit<OrderRow, 'id'>;

export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>;

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export type OrderItemInsert = Omit<OrderItemRow, 'id'>;

export interface CouponRow {
  code: string;
  type: string;
  value: number;
  min_subtotal: number;
  active: boolean;
  expires_at: string | null;
  description: string;
}

export type CouponInsert = CouponRow;

export interface ReviewRow {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  product_id: string | null;
  date: string;
  verified: boolean;
}

export type ReviewInsert = Omit<ReviewRow, 'id'>;

export interface AdminUserRow {
  id: string;
  email: string;
  created_at: string;
}

export type AdminUserInsert = Omit<AdminUserRow, 'id' | 'created_at'>;
