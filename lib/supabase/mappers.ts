import type { Product, ProductSize, ComboItem, ProductCategory, ProductTag } from '@/lib/types';
import type { ProductRow } from '@/lib/supabase/types';

export const COMBO_MARKER = '__combo';

export function toRow(p: Product) {
  const specs = Array.isArray(p.specs) ? [...p.specs] : [];
  if (p.comboItems?.length) {
    specs.push({ label: COMBO_MARKER, value: JSON.stringify(p.comboItems) });
  }
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    compare_at_price: p.compareAtPrice ?? null,
    currency: 'INR',
    images: p.images as any,
    variants: p.variants as any,
    sizes: p.sizes as any,
    specs: specs as any,
    tags: p.tags as any,
    rating: p.rating,
    review_count: p.reviewCount,
    stock: p.stock,
    shipping_info: p.shippingInfo,
    return_policy: p.returnPolicy,
    featured: p.featured,
    is_new: p.isNew,
    best_seller: p.bestSeller,
    limited_edition: p.limitedEdition,
    summer_collection: p.summerCollection,
    hidden: p.hidden,
    sale_enabled: p.saleEnabled,
    sale_ends_at: p.saleEndsAt ?? null,
    created_at: p.createdAt,
  };
}

export function mapProduct(p: ProductRow): Product {
  const rawSizes = Array.isArray(p.sizes) ? p.sizes : [];
  const sizes: ProductSize[] = rawSizes.map((s: any) =>
    typeof s === 'string' ? { name: s, price: p.price } : { name: s.name ?? 'One Size', price: Number(s.price ?? p.price), compareAtPrice: s.compareAtPrice ? Number(s.compareAtPrice) : undefined }
  );

  let specs = Array.isArray(p.specs) ? p.specs : [];
  let comboItems: ComboItem[] | undefined;
  const markerIdx = (specs as any[]).findIndex((s: any) => s?.label === COMBO_MARKER);
  if (markerIdx !== -1) {
    try {
      comboItems = JSON.parse((specs as any[])[markerIdx].value);
    } catch {}
    specs = (specs as any[]).filter((_: any, i: number) => i !== markerIdx);
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category as ProductCategory,
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compare_at_price ?? undefined,
    currency: p.currency,
    images: p.images as any[],
    variants: p.variants as any[],
    sizes,
    comboItems,
    specs: specs as any[],
    tags: p.tags as ProductTag[],
    rating: p.rating,
    reviewCount: p.review_count,
    stock: p.stock,
    shippingInfo: p.shipping_info,
    returnPolicy: p.return_policy,
    featured: p.featured,
    isNew: p.is_new,
    bestSeller: p.best_seller,
    limitedEdition: p.limited_edition,
    summerCollection: p.summer_collection,
    hidden: p.hidden,
    saleEnabled: p.sale_enabled,
    saleEndsAt: p.sale_ends_at ?? undefined,
    createdAt: p.created_at,
  };
}
