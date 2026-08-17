'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Zap, Minus, Plus, Star, Truck, RotateCcw, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { ProductCard } from '@/components/product-card';
import { getProductBySlug, getRelatedProducts, products as fallback } from '@/lib/products';
import { formatPrice, discountPercent } from '@/lib/format';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isInWishlist = useStore((s) => s.isInWishlist);
  const addRecentlyViewed = useStore((s) => s.addRecentlyViewed);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'returns'>('description');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?slug=${slug}`);
        const json = await res.json();
        if (json.products) {
          setProduct(json.products);
        }
      } catch {}
      // Fallback
      if (!product) {
        setProduct(getProductBySlug(slug));
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      setSelectedColor(product.variants[0]?.color ?? null);
      if (product.sizes.length === 1) setSelectedSize(product.sizes[0].name);
    }
  }, [product, addRecentlyViewed]);

  if (loading) return <SiteShell><div className="container-lux flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" /></div></SiteShell>;

  if (!product) {
    return (
      <SiteShell>
        <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="font-display text-3xl">Piece Not Found</p>
          <p className="mt-2 text-sm text-muted-foreground">This item may have been moved or sold out.</p>
          <Link href="/shop" className="btn-lux mt-6 bg-foreground text-background">Back To Shop</Link>
        </div>
      </SiteShell>
    );
  }

  const disc = discountPercent(product.price, product.compareAtPrice);
  const inWishlist = isInWishlist(product.id);
  const related = getRelatedProducts(product);
  const canAdd = selectedSize && selectedColor && product.stock > 0;

  const selectedSizePrice = product.sizes.find((s) => s.name === selectedSize);
  const displayPrice = selectedSizePrice?.price ?? (product.sizes.length > 0 ? Math.min(...product.sizes.map((s) => s.price)) : product.price);
  const displayCompare = selectedSizePrice?.compareAtPrice ?? product.compareAtPrice;
  const sizeDisc = discountPercent(displayPrice, displayCompare);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    addToCart(product, selectedSize, selectedColor, qty);
    toast.success('Added to bag');
  };

  const handleBuyNow = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    addToCart(product, selectedSize, selectedColor, qty);
    window.location.href = '/checkout';
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const tabs = [
    { id: 'description' as const, label: 'Description' },
    { id: 'specs' as const, label: 'Specifications' },
    { id: 'shipping' as const, label: 'Shipping' },
    { id: 'returns' as const, label: 'Returns' },
  ];

  return (
    <SiteShell>
      <div className="container-lux py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="transition-colors hover:text-foreground">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/shop?category=${product.category}`} className="capitalize transition-colors hover:text-foreground">{product.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col gap-4 lg:flex-row-reverse">
            <div
              className="relative aspect-[3/4] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-muted"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleZoomMove}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[activeImage].url}
                alt={product.images[activeImage].alt}
                className="h-full w-full object-cover transition-transform duration-300"
                style={zoomed ? { transform: `scale(2)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
              />
              {sizeDisc > 0 && <span className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-destructive-foreground">-{sizeDisc}%</span>}
              {product.limitedEdition && <span className="absolute right-4 top-4 rounded-full bg-foreground px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-background">Limited Edition</span>}
            </div>
            <div className="flex gap-3 lg:flex-col">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn('zoom-container h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-all lg:h-24 lg:w-20', activeImage === i ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:py-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="eyebrow capitalize">{product.category}</p>
              <h1 className="heading-3 mt-2">{product.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-3.5 w-3.5', i < Math.floor(product.rating) ? 'fill-foreground text-foreground' : 'text-muted-foreground/30')} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="font-display text-3xl">{formatPrice(displayPrice)}</span>
                {sizeDisc > 0 && <span className="text-lg text-muted-foreground line-through">{formatPrice(displayCompare!)}</span>}
                {sizeDisc > 0 && <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">Save {sizeDisc}%</span>}
                {!selectedSize && product.sizes.length > 1 && <span className="text-xs text-muted-foreground">Select a size to see its price</span>}
              </div>

              {/* Combo contents */}
              {product.comboItems && product.comboItems.length > 0 && (
                <div className="mt-8 rounded-2xl border border-border p-5">
                  <p className="eyebrow">This Combo Includes</p>
                  <ul className="mt-3 space-y-3">
                    {product.comboItems.map((item) => (
                      <li key={item.productId} className="flex items-center gap-3">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="h-14 w-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color selection */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Color</p>
                  <span className="text-sm text-muted-foreground">{selectedColor}</span>
                </div>
                <div className="mt-3 flex gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.color}
                      onClick={() => setSelectedColor(v.color)}
                      className={cn('flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all', selectedColor === v.color ? 'border-foreground' : 'border-border hover:border-muted-foreground')}
                      aria-label={v.color}
                      title={v.color}
                    >
                      <span className="h-7 w-7 rounded-full border border-border" style={{ backgroundColor: v.colorHex }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selection */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Size</p>
                  <button className="text-xs text-muted-foreground underline">Size Guide</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSize(s.name)}
                      className={cn('flex h-11 min-w-11 items-center justify-center rounded-lg border px-4 text-sm transition-all', selectedSize === s.name ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-accent')}
                    >
                      <span className="flex flex-col items-center leading-tight">
                        <span>{s.name}</span>
                        <span className={cn('text-[10px]', selectedSize === s.name ? 'text-background/70' : 'text-muted-foreground')}>{formatPrice(s.price)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock indicator */}
              {product.stock <= 5 && product.stock > 0 && (
                <p className="mt-4 flex items-center gap-2 text-xs text-warning">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
                  Only {product.stock} left in stock
                </p>
              )}
              {product.stock === 0 && <p className="mt-4 text-xs text-destructive">Currently sold out</p>}

              {/* Quantity */}
              <div className="mt-6">
                <p className="eyebrow">Quantity</p>
                <div className="mt-3 flex items-center border border-border w-fit">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-accent" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                  <span className="w-12 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-accent" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={handleAddToCart} disabled={!canAdd} className="btn-lux flex-1 bg-foreground text-background disabled:opacity-50">
                  <ShoppingBag className="h-4 w-4" /> Add To Bag
                </button>
                <button onClick={handleBuyNow} disabled={!canAdd} className="btn-lux flex-1 border border-foreground disabled:opacity-50">
                  <Zap className="h-4 w-4" /> Buy Now
                </button>
                <button onClick={() => { toggleWishlist(product.id); toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist'); }} className={cn('flex h-14 w-14 items-center justify-center rounded-full border transition-all', inWishlist ? 'border-destructive text-destructive' : 'border-border hover:bg-accent')} aria-label="Wishlist">
                  <Heart className={cn('h-5 w-5', inWishlist && 'fill-current')} strokeWidth={1.5} />
                </button>
              </div>

              {/* Quick info */}
              <div className="mt-8 space-y-3 rounded-2xl border border-border p-5">
                <div className="flex items-start gap-3 text-sm">
                  <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-muted-foreground">{product.shippingInfo}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <RotateCcw className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-muted-foreground">{product.returnPolicy}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-8">
                <div className="flex gap-6 border-b border-border">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn('relative pb-3 text-xs font-medium uppercase tracking-[0.15em] transition-colors', activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
                    >
                      {tab.label}
                      {activeTab === tab.id && <motion.div layoutId="tab-indicator" className="absolute -bottom-px left-0 h-0.5 w-full bg-foreground" />}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="py-5 text-sm leading-relaxed text-muted-foreground"
                  >
                    {activeTab === 'description' && <p>{product.description}</p>}
                    {activeTab === 'specs' && (
                      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {product.specs.map((spec) => (
                          <div key={spec.label} className="flex justify-between border-b border-border/50 pb-2">
                            <dt className="text-foreground">{spec.label}</dt>
                            <dd>{spec.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {activeTab === 'shipping' && (
                      <div className="space-y-2">
                        <p>{product.shippingInfo}</p>
                        <p>Standard delivery: 3-5 business days. Express delivery: 1-2 business days.</p>
                        <p>Carbon-neutral worldwide shipping available.</p>
                      </div>
                    )}
                    {activeTab === 'returns' && (
                      <div className="space-y-2">
                        <p>{product.returnPolicy}</p>
                        <p>Refunds are processed within 5 business days of receiving the returned item.</p>
                        <p>Items must be unworn with original tags and packaging.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20 md:mt-32">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="eyebrow">You May Also Like</p>
                <h2 className="heading-3 mt-2">Complete The Look</h2>
              </div>
              <Link href="/shop" className="link-underline text-xs font-medium uppercase tracking-[0.15em]">View All</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
