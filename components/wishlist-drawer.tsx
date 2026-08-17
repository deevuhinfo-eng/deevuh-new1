'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useStore } from '@/lib/store';
import { products } from '@/lib/products';
import { formatPrice, discountPercent } from '@/lib/format';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface WishlistDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WishlistDrawer({ open, onOpenChange }: WishlistDrawerProps) {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Wishlist ({items.length})</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border">
              <Heart className="h-8 w-8 text-muted-foreground" strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="font-display text-xl">No saved items yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any product to save it</p>
            </div>
            <Link href="/shop" onClick={() => onOpenChange(false)} className="btn-lux bg-foreground text-background">
              Explore Collection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.map((p) => {
              const disc = discountPercent(p.price, p.compareAtPrice);
              return (
                <div key={p.id} className="flex gap-4 border-b border-border/50 py-4 last:border-0">
                  <Link href={`/product/${p.slug}`} onClick={() => onOpenChange(false)} className="zoom-container h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0].url} alt={p.images[0].alt} className="zoom-img h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link href={`/product/${p.slug}`} onClick={() => onOpenChange(false)} className="text-sm font-medium leading-tight transition-colors hover:text-muted-foreground">
                      {p.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatPrice(p.price)}</span>
                        {disc > 0 && <span className="text-xs text-muted-foreground line-through">{formatPrice(p.compareAtPrice!)}</span>}
                      </div>
                      <button onClick={() => toggleWishlist(p.id)} className="text-muted-foreground transition-colors hover:text-destructive" aria-label="Remove from wishlist">
                        <Heart className="h-4 w-4 fill-current" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
