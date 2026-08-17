export type ProductCategory =
  | 'coordsets'
  | 'upperwear'
  | 'bottomwear'
  | 'combos';

export interface ProductSize {
  name: string;
  price: number;
  compareAtPrice?: number;
}

export interface ComboItem {
  productId: string;
  name: string;
  image?: string;
  quantity: number;
}

export type ProductTag = 'featured' | 'new' | 'bestseller' | 'limited' | 'summer' | 'trending';

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductVariant {
  color: string;
  colorHex: string;
  images: ProductImage[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  variants: ProductVariant[];
  sizes: ProductSize[];
  comboItems?: ComboItem[];
  specs: ProductSpec[];
  tags: ProductTag[];
  rating: number;
  reviewCount: number;
  stock: number;
  shippingInfo: string;
  returnPolicy: string;
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  limitedEdition: boolean;
  summerCollection: boolean;
  hidden: boolean;
  saleEnabled: boolean;
  saleEndsAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  productId?: string;
  date: string;
  verified: boolean;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal: number;
  active: boolean;
  expiresAt?: string;
  description: string;
}

export interface SiteConfig {
  brand: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  social: {
    instagram: string;
    facebook: string;
    pinterest: string;
    youtube: string;
  };
  shipping: {
    freeThreshold: number;
    standardCharge: number;
    expressCharge: number;
  };
  tax: {
    gstRate: number;
    enabled: boolean;
  };
  cod: {
    enabled: boolean;
    fee: number;
  };
  hero: {
    videoUrl: string;
    poster: string;
    headline: string;
    subheadline: string;
  };
  freeShippingBanner: string;
}
