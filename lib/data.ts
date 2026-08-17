import type { Product, Coupon, Review, SiteConfig } from './types';
import { products as fallbackProducts } from './products';
import { siteConfig as fallbackConfig, coupons as fallbackCoupons, reviews as fallbackReviews } from './config';

const API = typeof window !== 'undefined' ? window.location.origin : '';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getProducts(options?: {
  slug?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options?.slug) params.set('slug', options.slug);
  if (options?.category) params.set('category', options.category);
  if (options?.tag) params.set('tag', options.tag);
  if (options?.featured) params.set('featured', 'true');

  const data = await fetchJson<{ products: Product[] }>(
    `${API}/api/products?${params.toString()}`
  );

  if (data?.products) {
    return Array.isArray(data.products) ? data.products : [data.products];
  }

  // Fallback to local
  let result = fallbackProducts.filter((p) => !p.hidden);
  if (options?.slug) result = result.filter((p) => p.slug === options.slug);
  if (options?.category) result = result.filter((p) => p.category === options.category);
  if (options?.tag) {
    const tagMap: Record<string, string> = {
      featured: 'featured', new: 'isNew', bestseller: 'bestSeller',
      limited: 'limitedEdition', summer: 'summerCollection',
    };
    const key = tagMap[options.tag];
    if (key) result = result.filter((p) => (p as any)[key] === true);
  }
  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts({ slug });
  return products[0];
}

export async function getCoupons(): Promise<Coupon[]> {
  const data = await fetchJson<{ coupons: Coupon[] }>(`${API}/api/coupons`);
  return data?.coupons ?? fallbackCoupons;
}

export async function getReviews(): Promise<Review[]> {
  const data = await fetchJson<{ reviews: Review[] }>(`${API}/api/reviews`);
  return data?.reviews ?? fallbackReviews;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const data = await fetchJson<{ config: SiteConfig }>(`${API}/api/config`);
  return data?.config ?? fallbackConfig;
}
