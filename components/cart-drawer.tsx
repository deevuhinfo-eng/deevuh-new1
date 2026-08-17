'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useStore, cartTotal, cartCount } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { useConfig } from '@/lib/use-config';
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { config } = useConfig();
  const cart = useStore((s) => s.cart);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const total = cartTotal(cart);
  const count = cartCount(cart);
  const remaining = Math.max(0, config.shipping.freeThreshold - total);
  const progress = Math.min(100, (total / config.shipping.freeThreshold) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Your Bag ({count})</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="font-display text-xl">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Discover our latest collection</p>
            </div>
            <Link href="/shop" onClick={() => onOpenChange(false)} className="btn-lux bg-foreground text-background">
              Explore Collection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {remaining > 0 ? (
              <div className="border-b border-border px-6 py-3">
                <p className="text-center text-xs text-muted-foreground">
                  Add <span className="font-medium text-foreground">{formatPrice(remaining)}</span> for free express shipping
                </p>
                <div className="mt-2 h-px overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-foreground transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="border-b border-border px-6 py-3">
                <p className="text-center text-xs font-medium text-success">You qualify for free express shipping</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 border-b border-border/50 py-4 last:border-0"
                >
                  <div className="zoom-container h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="zoom-img h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{item.name}</p>
                      <button
                        onClick={() => { removeFromCart(item.productId, item.size, item.color); toast.success('Removed from bag'); }}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.color} · Size {item.size}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-accent" aria-label="Decrease">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-accent" aria-label="Increase">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Shipping and taxes calculated at checkout</p>
              <Link href="/checkout" onClick={() => onOpenChange(false)} className="btn-lux mt-4 w-full bg-foreground text-background">
                Checkout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/cart" onClick={() => onOpenChange(false)} className="mt-2 block text-center text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
                View Full Bag
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
