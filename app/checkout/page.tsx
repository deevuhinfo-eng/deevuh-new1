'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Smartphone, Building2, Wallet, Banknote, Tag, X, ArrowRight, ArrowLeft, Check, UserCheck, Loader2 } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { useStore, cartTotal } from '@/lib/store';
import { formatPrice, generateOrderId } from '@/lib/format';
import { useConfig } from '@/lib/use-config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Pay via UPI ID' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Paytm, PhonePe, etc.' },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay ₹149 online to confirm, rest on delivery' },
];

export default function CheckoutPage() {
  const { config, coupons } = useConfig();
  const cart = useStore((s) => s.cart);
  const couponCode = useStore((s) => s.couponCode);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const [couponInput, setCouponInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('payment') === 'failed') {
      toast.error('Payment failed. Please try again.');
      window.history.replaceState({}, '', '/checkout');
    } else if (searchParams.get('payment') === 'error') {
      toast.error('Something went wrong while processing your payment.');
      window.history.replaceState({}, '', '/checkout');
    }
  }, [searchParams]);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '', country: '', pincode: '', notes: '',
  });

  useEffect(() => {
    let active = true;
    fetch('/api/account/profile')
      .then((r) => {
        if (r.status === 401) {
          if (active) setSignedIn(false);
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((j) => {
        if (!active) return;
        if (!j?.profile) return setSignedIn(false);
        setSignedIn(true);
        const p = j.profile;
        setCustomerId(p.id);
        setForm((f) => ({
          ...f,
          name: f.name || p.name,
          email: f.email || p.email,
          phone: f.phone || p.phone,
          address: f.address || p.address,
          city: f.city || p.city,
          state: f.state || p.state,
          country: f.country || p.country,
          pincode: f.pincode || p.pincode,
        }));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const subtotal = cartTotal(cart);
  const coupon = coupons.find((c) => c.code === couponCode && c.active);
  const discount = coupon && subtotal >= coupon.minSubtotal ? (coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= config.shipping.freeThreshold || afterDiscount === 0 ? 0 : config.shipping.standardCharge;
  const tax = config.tax.enabled ? Math.round((afterDiscount * config.tax.gstRate) / 100) : 0;
  const grandTotal = afterDiscount + shipping + tax;
  const isCod = paymentMethod === 'cod';
  const codFee = config.cod?.fee ?? 149;
  const codEnabled = config.cod?.enabled ?? true;
  const payNow = isCod ? codFee : grandTotal;
  const dueOnDelivery = isCod ? Math.max(0, grandTotal - codFee) : 0;

  const handleCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const found = coupons.find((c) => c.code === code && c.active);
    if (!found) { toast.error('Invalid coupon code'); return; }
    if (subtotal < found.minSubtotal) { toast.error(`Minimum order of ${formatPrice(found.minSubtotal)} required`); return; }
    applyCoupon(code);
    toast.success('Coupon applied');
    setCouponInput('');
  };

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const signInToCheckout = async () => {
    setSigningIn(true);
    try {
      window.location.href = '/account?next=%2Fcheckout';
    } catch {
      setSigningIn(false);
      toast.error('Could not start sign-in. Please try again.');
    }
  };

  const validate = () => {
    const required = ['name', 'phone', 'email', 'address', 'city', 'state', 'country', 'pincode'];
    for (const field of required) {
      if (!form[field as keyof typeof form].trim()) { toast.error(`Please fill in ${field.charAt(0).toUpperCase() + field.slice(1)}`); return false; }
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { toast.error('Please enter a valid email'); return false; }
    return true;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error('Your bag is empty'); return; }
    if (!validate()) return;
    setProcessing(true);

    try {
      const orderId = generateOrderId();
      const txnId = 'MN' + Math.random().toString(36).slice(2, 14).toUpperCase();
      const orderData = {
        orderId, txnId, ...form, paymentMethod,
        items: cart, subtotal, discount, shipping, tax, grandTotal,
        codFee: isCod ? codFee : 0, dueOnDelivery: isCod ? Math.max(0, grandTotal - codFee) : 0,
        couponCode, status: isCod ? 'cod_confirmed' : 'paid', placedAt: new Date().toISOString(),
      };
      try { localStorage.setItem('maison-noir-last-order', JSON.stringify(orderData)); } catch {}

      const notes = isCod ? `[COD Fee: ₹${codFee} paid, ₹${dueOnDelivery} due on delivery]` : '';
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId, txnId, paymentMethod, pgMode: paymentMethod, amount: payNow,
          customer: { name: form.name, email: form.email, phone: form.phone },
          form, items: cart, totals: { subtotal, discount, shipping, tax, grandTotal },
          notes, couponCode, codFee: isCod ? codFee : 0, dueOnDelivery: isCod ? dueOnDelivery : 0,
          customerId,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const payuForm = doc.querySelector('form');
        if (payuForm) {
          // Submit PayU form in current tab (redirect flow)
          document.body.appendChild(payuForm);
          payuForm.submit();
          return;
        }
      }
      // Non-HTML response: JSON error
      const json = await res.json().catch(() => null);
      toast.error(json?.error || 'Payment could not be initiated');
    } catch {
      toast.error('Payment could not be initiated. Please try again.');
    }
    setProcessing(false);
  };

  if (cart.length === 0) {
    return (
      <SiteShell>
        <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="font-display text-3xl">Your Bag Is Empty</p>
          <p className="mt-2 text-sm text-muted-foreground">Add some pieces before checking out.</p>
          <Link href="/shop" className="btn-lux mt-8 bg-foreground text-background">Explore Collection</Link>
        </div>
      </SiteShell>
    );
  }

  if (signedIn === false) {
    return (
      <SiteShell>
        <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <UserCheck className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <h1 className="mt-4 heading-2">Sign In To Continue</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You need to be signed in to complete your order. Your bag is safe — you&apos;ll be back here to check out.
            </p>
            <button
              onClick={signInToCheckout}
              disabled={signingIn}
              className="btn-lux mt-8 w-full bg-foreground text-background disabled:opacity-70"
            >
              {signingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
              {signingIn ? 'Redirecting to sign in...' : 'Sign In To Continue'}
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Secure checkout · Your details stay private</p>
          </motion.div>
        </div>
      </SiteShell>
    );
  }

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground';

  return (
    <SiteShell>
      <div className="container-lux py-12 md:py-20">
        <Link href="/cart" className="mb-8 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back To Bag
        </Link>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="heading-2">Checkout</motion.h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {/* Form */}
          <div className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="mb-4 font-display text-xl">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="eyebrow">Full Name *</label><input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass + ' mt-2'} placeholder="Jane Doe" /></div>
                <div><label className="eyebrow">Phone *</label><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass + ' mt-2'} placeholder="+1 (212) 555-0148" /></div>
                <div className="sm:col-span-2"><label className="eyebrow">Email *</label><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass + ' mt-2'} placeholder="jane@example.com" /></div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-display text-xl">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className="eyebrow">Street Address *</label><input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass + ' mt-2'} placeholder="120 Mercer Street" /></div>
                <div><label className="eyebrow">City *</label><input value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass + ' mt-2'} placeholder="New York" /></div>
                <div><label className="eyebrow">State / Province *</label><input value={form.state} onChange={(e) => update('state', e.target.value)} className={inputClass + ' mt-2'} placeholder="NY" /></div>
                <div><label className="eyebrow">Country *</label><input value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClass + ' mt-2'} placeholder="United States" /></div>
                <div><label className="eyebrow">Pincode / ZIP *</label><input value={form.pincode} onChange={(e) => update('pincode', e.target.value)} className={inputClass + ' mt-2'} placeholder="10012" /></div>
                <div className="sm:col-span-2"><label className="eyebrow">Order Notes (Optional)</label><textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} className={inputClass + ' mt-2 resize-none'} placeholder="Gift wrapping, delivery instructions..." /></div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-display text-xl">Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={cn('flex items-center gap-3 rounded-xl border p-4 text-left transition-all', paymentMethod === m.id ? 'border-foreground bg-accent/50' : 'border-border hover:bg-accent/30', m.id === 'cod' && !codEnabled ? 'pointer-events-none opacity-40' : '')}
                  >
                    <m.icon className="h-5 w-5" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                    <div className={cn('ml-auto flex h-5 w-5 items-center justify-center rounded-full border', paymentMethod === m.id ? 'border-foreground bg-foreground text-background' : 'border-border')}>
                      {paymentMethod === m.id && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                ))}
              </div>
              {isCod && (
                <div className="mt-3 rounded-lg border border-border bg-accent/40 p-4 text-sm">
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pay <span className="font-semibold text-foreground">{formatPrice(codFee)}</span> now to confirm your COD order. Balance of{' '}
                    <span className="font-semibold text-foreground">{formatPrice(dueOnDelivery)}</span> will be collected in cash on delivery.
                  </p>
                </div>
              )}
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Secure payment powered by PayU. Your data is encrypted.</p>
            </section>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border p-6">
              <h2 className="font-display text-xl">Order Summary</h2>

              <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-16 w-14 rounded-lg object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium leading-tight">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.color} · {item.size} · Qty {item.quantity}</p>
                      <p className="mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mt-4 border-t border-border pt-4">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-success/10 px-4 py-3 text-sm">
                    <span className="flex items-center gap-2 text-success"><Tag className="h-3.5 w-3.5" /> {coupon.code}</span>
                    <button onClick={() => { removeCoupon(); toast.success('Coupon removed'); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-foreground" />
                    <button onClick={handleCoupon} className="rounded-lg bg-foreground px-4 py-2 text-xs uppercase tracking-wider text-background">Apply</button>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                {config.tax.enabled && <div className="flex justify-between"><span className="text-muted-foreground">GST ({config.tax.gstRate}%)</span><span>{formatPrice(tax)}</span></div>}
                <div className="flex justify-between border-t border-border pt-3 text-base font-medium"><span>Grand Total</span><span>{formatPrice(grandTotal)}</span></div>
                {isCod && (
                  <>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">COD Fee (now)</span><span className="font-medium">{formatPrice(codFee)}</span></div>
                    <div className="flex justify-between text-sm text-warning"><span>Balance Due on Delivery</span><span className="font-medium">{formatPrice(dueOnDelivery)}</span></div>
                  </>
                )}
              </div>

              <button onClick={handleCheckout} disabled={processing} className="btn-lux mt-6 w-full bg-foreground text-background disabled:opacity-70">
                {processing ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" /> Processing Payment...</>
                ) : (
                  isCod
                    ? <>Confirm COD · Pay {formatPrice(payNow)} <ArrowRight className="h-3.5 w-3.5" /></>
                    : <>Pay {formatPrice(payNow)} <ArrowRight className="h-3.5 w-3.5" /></>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> 256-bit SSL encrypted checkout</p>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
