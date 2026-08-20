'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { useStore, cartTotal } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { useConfig } from '@/lib/use-config';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CartPage() {
  const { config, coupons } = useConfig();
  const cart = useStore((s) => s.cart);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const couponCode = useStore((s) => s.couponCode);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const [couponInput, setCouponInput] = useState('');

  const subtotal = cartTotal(cart);
  const coupon = coupons.find((c) => c.code === couponCode && c.active);
  const rawDiscount = coupon && subtotal >= coupon.minSubtotal
    ? coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value
    : 0;
  const discount = Math.min(rawDiscount, subtotal);
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= config.shipping.freeThreshold || afterDiscount === 0 ? 0 : config.shipping.standardCharge;
  const tax = config.tax.enabled ? Math.round((afterDiscount * config.tax.gstRate) / 100) : 0;
  const grandTotal = afterDiscount + shipping + tax;

  const handleCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const found = coupons.find((c) => c.code === code && c.active);
    if (!found) { toast.error('Invalid coupon code'); return; }
    if (subtotal < found.minSubtotal) { toast.error(`Minimum order of ${formatPrice(found.minSubtotal)} required`); return; }
    applyCoupon(code);
    toast.success('Coupon applied: ' + found.description);
    setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <SiteShell>
        <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="mt-6 font-display text-3xl">Your Bag Is Empty</p>
          <p className="mt-2 text-sm text-muted-foreground">Discover our curated collection of timeless pieces.</p>
          <Link href="/shop" className="btn-lux mt-8 bg-foreground text-background">Explore Collection <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="container-lux py-12 md:py-20">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="heading-2">Your Shopping Bag</motion.h1>
        <p className="mt-2 text-sm text-muted-foreground">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.size}-${item.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 border-b border-border pb-6"
              >
                <Link href={`/product/${item.slug}`} className="zoom-container h-32 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="zoom-img h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/product/${item.slug}`} className="font-display text-lg transition-colors hover:text-muted-foreground">{item.name}</Link>
                      <p className="mt-1 text-xs text-muted-foreground">Size {item.size}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-accent" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-accent" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => { removeFromCart(item.productId, item.size, item.color); toast.success('Removed from bag'); }} className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border p-6">
              <h2 className="font-display text-xl">Order Summary</h2>

              {/* Coupon */}
              <div className="mt-5">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-success/10 px-4 py-3 text-sm">
                    <span className="flex items-center gap-2 text-success"><Tag className="h-3.5 w-3.5" /> {coupon.code}</span>
                    <button onClick={() => { removeCoupon(); toast.success('Coupon removed'); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-foreground" />
                    <button onClick={handleCoupon} className="rounded-lg bg-foreground px-4 py-2.5 text-xs uppercase tracking-wider text-background transition-opacity hover:opacity-90">Apply</button>
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">Try WELCOME10 for 10% off</p>
              </div>

              <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                {config.tax.enabled && <div className="flex justify-between"><span className="text-muted-foreground">GST ({config.tax.gstRate}%)</span><span>{formatPrice(tax)}</span></div>}
                <div className="flex justify-between border-t border-border pt-3 text-base font-medium"><span>Grand Total</span><span>{formatPrice(grandTotal)}</span></div>
              </div>

              {subtotal < config.shipping.freeThreshold && (
                <p className="mt-3 text-center text-xs text-muted-foreground">Add {formatPrice(config.shipping.freeThreshold - subtotal)} for free shipping</p>
              )}

              <Link href="/checkout" className="btn-lux mt-6 w-full bg-foreground text-background">Proceed To Checkout <ArrowRight className="h-3.5 w-3.5" /></Link>
              <Link href="/shop" className="mt-3 block text-center text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
