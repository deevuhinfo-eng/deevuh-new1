'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatPrice, discountPercent } from '@/lib/format';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isInWishlist = useStore((s) => s.isInWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const inWishlist = isInWishlist(product.id);
  const disc = discountPercent(product.price, product.compareAtPrice);
  const activeImg = hovered && product.images[1] ? product.images[1].url : product.images[0].url;
  const fromPrice = product.sizes.length > 0 ? Math.min(...product.sizes.map((s) => s.price)) : product.price;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes.length === 1) {
      addToCart(product, product.sizes[0].name, product.variants[0].color, 1);
      toast.success('Added to bag');
    } else {
      toast.info('Select a size on the product page');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div
          className="zoom-container relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImg}
            alt={product.images[0].alt}
            className="zoom-img h-full w-full object-cover"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur">New</span>
            )}
            {disc > 0 && (
              <span className="rounded-full bg-destructive px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-destructive-foreground">-{disc}%</span>
            )}
            {product.limitedEdition && (
              <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-background">Limited</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist'); }}
            className={cn('absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-all hover:scale-110', inWishlist && 'text-destructive')}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} strokeWidth={1.5} />
          </button>

          {/* Stock indicator */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur">
              Only {product.stock} left
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <span className="rounded-full bg-foreground px-6 py-2 text-xs font-medium uppercase tracking-wider text-background">Sold Out</span>
            </div>
          )}

          {/* Quick add button - appears on hover */}
          {product.stock > 0 && product.sizes.length === 1 && (
            <motion.button
              onClick={quickAdd}
              className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background opacity-0 transition-all hover:scale-110 group-hover:opacity-100"
              aria-label="Quick add"
              initial={false}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            </motion.button>
          )}
        </div>

        <div className="mt-4">
          <p className="eyebrow">{product.category}</p>
          <h3 className="mt-1 font-display text-lg leading-tight transition-colors group-hover:text-muted-foreground">{product.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{product.tagline}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium">{product.sizes.length > 0 && fromPrice < product.price ? `From ${formatPrice(fromPrice)}` : formatPrice(product.price)}</span>
            {disc > 0 && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice!)}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
