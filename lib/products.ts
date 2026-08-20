import type { Product } from './types';

export const products: Product[] = [
  // ── Co-ord Sets ─────────────────────────────────────────────────────────
  {
    id: 'p13', slug: 'rani-coord-set', name: 'Rani Co-ord Set', category: 'coordsets',
    tagline: 'Cream matching set, top + bottom',
    description:
      'A clean, breathable co-ord set in soft cream. Matching top and bottom, cut for an easy relaxed fit that works from morning to evening. A versatile piece that layers beautifully.',
    price: 2199, currency: 'INR',
    images: [
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/rani-b9cfe0a5.jpg', alt: 'Rani co-ord set front' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/rani-afe7e1c3.jpg', alt: 'Rani co-ord set side' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/rani-45032326.jpg', alt: 'Rani co-ord set detail' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/rani-7152c8c4.jpg', alt: 'Rani co-ord set styling' },
    ],
    variants: [
      { color: 'Cream', colorHex: '#ece3d3', images: [{ url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/rani-b9cfe0a5.jpg', alt: 'Cream co-ord' }] },
    ],
    sizes: [
      { name: 'S', price: 2199 },
      { name: 'M', price: 2299 },
      { name: 'L', price: 2399 },
    ],
    specs: [
      { label: 'Material', value: 'Cotton blend' },
      { label: 'Fit', value: 'Relaxed' },
      { label: 'Includes', value: 'Top + Bottom' },
      { label: 'Care', value: 'Machine wash cold' },
      { label: 'Origin', value: 'Crafted in India' },
    ],
    tags: ['new', 'bestseller'], rating: 4.8, reviewCount: 12, stock: 10,
    shippingInfo: 'Free express shipping. Ships within 2 business days.',
    returnPolicy: '7-day easy returns on unworn items with original tags.',
    featured: true, isNew: false, bestSeller: true, limitedEdition: false, summerCollection: false,
    hidden: false, saleEnabled: false, createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'p15', slug: 'mocha-coord-set', name: 'Mocha Brown Co-ord Set', category: 'coordsets',
    tagline: 'Warm mocha matching set, top + bottom',
    description:
      'A warm mocha brown co-ord set with a clean, relaxed silhouette. Matching top and bottom in a versatile shade that pairs effortlessly — a staple piece built for everyday wear.',
    price: 2199, currency: 'INR',
    images: [
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/mocha-54e2d9b0.jpg', alt: 'Mocha co-ord set front' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/mocha-6f9014cc.jpg', alt: 'Mocha co-ord set side' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/mocha-5a67ec8e.jpg', alt: 'Mocha co-ord set detail' },
    ],
    variants: [
      { color: 'Mocha Brown', colorHex: '#8a6f5d', images: [{ url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/mocha-54e2d9b0.jpg', alt: 'Mocha co-ord' }] },
    ],
    sizes: [
      { name: 'S', price: 2199 },
      { name: 'M', price: 2199 },
      { name: 'L', price: 2199 },
      { name: 'XL', price: 2499 },
      { name: 'XXL', price: 2499 },
    ],
    specs: [
      { label: 'Material', value: 'Cotton blend' },
      { label: 'Fit', value: 'Relaxed' },
      { label: 'Includes', value: 'Top + Bottom' },
      { label: 'Care', value: 'Machine wash cold' },
      { label: 'Origin', value: 'Crafted in India' },
    ],
    tags: ['new'], rating: 4.8, reviewCount: 10, stock: 10,
    shippingInfo: 'Free express shipping. Ships within 2 business days.',
    returnPolicy: '7-day easy returns on unworn items with original tags.',
    featured: true, isNew: false, bestSeller: false, limitedEdition: false, summerCollection: false,
    hidden: false, saleEnabled: false, createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'p16', slug: 'vatavaran-coord-set', name: 'Vatavaran Edition Co-ord Set', category: 'coordsets',
    tagline: 'Limited Vatavaran edition, blue matching set',
    description:
      'The Vatavaran edition — a limited run co-ord set in a rich blue. Matching top and bottom with a clean, modern fit. A distinctive piece from our seasonal capsule.',
    price: 1799, currency: 'INR',
    images: [
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/vata-d216d8f6.jpg', alt: 'Vatavaran co-ord set front' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/vata-b5d8a1ce.jpg', alt: 'Vatavaran co-ord set side' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/vata-aae975ad.jpg', alt: 'Vatavaran co-ord set detail' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/vata-54aee9ab.jpg', alt: 'Vatavaran co-ord set styling' },
    ],
    variants: [
      { color: 'Blue', colorHex: '#3a5a9c', images: [{ url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/vata-d216d8f6.jpg', alt: 'Blue co-ord' }] },
    ],
    sizes: [
      { name: 'S', price: 1799 },
      { name: 'M', price: 1799 },
      { name: 'L', price: 1799 },
    ],
    specs: [
      { label: 'Material', value: 'Cotton blend' },
      { label: 'Fit', value: 'Relaxed' },
      { label: 'Includes', value: 'Top + Bottom' },
      { label: 'Care', value: 'Machine wash cold' },
      { label: 'Origin', value: 'Crafted in India' },
    ],
    tags: ['new', 'limited'], rating: 4.8, reviewCount: 8, stock: 12,
    shippingInfo: 'Free express shipping. Ships within 2 business days.',
    returnPolicy: '7-day easy returns on unworn items with original tags.',
    featured: true, isNew: false, bestSeller: false, limitedEdition: true, summerCollection: false,
    hidden: false, saleEnabled: false, createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'p17', slug: 'midnight-muse', name: 'Midnight Muse', category: 'coordsets',
    tagline: 'Dark midnight co-ord set, top + bottom',
    description:
      'The Midnight Muse co-ord set in a deep midnight shade. Matching top and bottom with a clean, relaxed fit — an understated piece that pairs effortlessly from day to night.',
    price: 1899, currency: 'INR',
    images: [
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/midnight-front.jpg', alt: 'Midnight Muse co-ord set front' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/midnight-side.jpg', alt: 'Midnight Muse co-ord set side' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/midnight-detail.jpg', alt: 'Midnight Muse co-ord set detail' },
    ],
    variants: [
      { color: 'Midnight', colorHex: '#1a1a2e', images: [{ url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/midnight-front.jpg', alt: 'Midnight Muse co-ord' }] },
    ],
    sizes: [
      { name: 'S', price: 1899 },
      { name: 'M', price: 1899 },
      { name: 'L', price: 1899 },
    ],
    specs: [
      { label: 'Material', value: 'Cotton blend' },
      { label: 'Fit', value: 'Relaxed' },
      { label: 'Includes', value: 'Top + Bottom' },
      { label: 'Care', value: 'Machine wash cold' },
      { label: 'Origin', value: 'Crafted in India' },
    ],
    tags: ['new'], rating: 4.8, reviewCount: 0, stock: 10,
    shippingInfo: 'Free express shipping. Ships within 2 business days.',
    returnPolicy: '7-day easy returns on unworn items with original tags.',
    featured: true, isNew: true, bestSeller: false, limitedEdition: false, summerCollection: false,
    hidden: false, saleEnabled: false, createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'p18', slug: 'mandarin-muse', name: 'Mandarin Muse', category: 'coordsets',
    tagline: 'Warm mandarin co-ord set, top + bottom',
    description:
      'The Mandarin Muse co-ord set in a warm mandarin shade. Matching top and bottom with a clean, relaxed fit — a bright, understated piece that lifts any wardrobe.',
    price: 1899, currency: 'INR',
    images: [
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/mandarin-front.jpg', alt: 'Mandarin Muse co-ord set front' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/mandarin-side.jpg', alt: 'Mandarin Muse co-ord set side' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/mandarin-detail.jpg', alt: 'Mandarin Muse co-ord set detail' },
    ],
    variants: [
      { color: 'Mandarin', colorHex: '#f28c28', images: [{ url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/mandarin-front.jpg', alt: 'Mandarin Muse co-ord' }] },
    ],
    sizes: [
      { name: 'S', price: 1899 },
      { name: 'M', price: 1899 },
      { name: 'L', price: 1999 },
    ],
    specs: [
      { label: 'Material', value: 'Cotton blend' },
      { label: 'Fit', value: 'Relaxed' },
      { label: 'Includes', value: 'Top + Bottom' },
      { label: 'Care', value: 'Machine wash cold' },
      { label: 'Origin', value: 'Crafted in India' },
    ],
    tags: ['new'], rating: 4.8, reviewCount: 0, stock: 10,
    shippingInfo: 'Free express shipping. Ships within 2 business days.',
    returnPolicy: '7-day easy returns on unworn items with original tags.',
    featured: true, isNew: true, bestSeller: false, limitedEdition: false, summerCollection: false,
    hidden: false, saleEnabled: false, createdAt: '2026-08-10T00:00:00Z',
  },

  // ── Bottom Wear ─────────────────────────────────────────────────────────
  {
    id: 'p14', slug: 'korean-pant', name: 'Korean Pant', category: 'bottomwear',
    tagline: 'Trend-forward fit, everyday comfort',
    description:
      'A versatile Korean-style pant with a clean, modern fit. Structured yet comfortable, this pair pairs effortlessly with everything from blouses to co-ord tops.',
    price: 2599, currency: 'INR',
    images: [
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/korean-fdf68321.jpg', alt: 'Korean pant front' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/korean-f00fd2a6.jpg', alt: 'Korean pant side' },
      { url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/korean-c3bba7eb.jpg', alt: 'Korean pant detail' },
    ],
    variants: [
      { color: 'Default', colorHex: '#888888', images: [{ url: 'https://asquzqghumidhdwfmrzv.supabase.co/storage/v1/object/public/images/products/korean-fdf68321.jpg', alt: 'Korean pant' }] },
    ],
    sizes: [
      { name: 'S', price: 2599 },
      { name: 'M', price: 2599 },
      { name: 'L', price: 2599 },
      { name: 'XL', price: 2799 },
      { name: 'XXL', price: 2799 },
    ],
    specs: [
      { label: 'Material', value: 'Cotton blend' },
      { label: 'Fit', value: 'High-rise, tapered' },
      { label: 'Care', value: 'Machine wash cold' },
      { label: 'Origin', value: 'Crafted in India' },
    ],
    tags: ['new', 'bestseller'], rating: 4.8, reviewCount: 15, stock: 12,
    shippingInfo: 'Free express shipping. Ships within 2 business days.',
    returnPolicy: '7-day easy returns on unworn items with original tags.',
    featured: true, isNew: false, bestSeller: true, limitedEdition: false, summerCollection: false,
    hidden: false, saleEnabled: false, createdAt: '2026-08-10T00:00:00Z',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getVisibleProducts(): Product[] {
  return products.filter((p) => !p.hidden);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  const sameCat = products.filter((p) => p.id !== product.id && !p.hidden && p.category === product.category);
  const other = products.filter((p) => p.id !== product.id && !p.hidden && p.category !== product.category);
  return [...sameCat, ...other].slice(0, count);
}

export const categoryLabels: Record<string, string> = {
  coordsets: 'Co-ord Sets',
  bottomwear: 'Bottom Wear',
};
