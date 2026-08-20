'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Package, Mail, ArrowRight, Download, Home } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { formatPrice, formatDate } from '@/lib/format';
import { useStore } from '@/lib/store';

interface OrderData {
  orderId: string;
  txnId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  notes: string;
  paymentMethod: string;
  codFee?: number;
  dueOnDelivery?: number;
  items: { name: string; price: number; quantity: number; color: string; size: string; image: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  placedAt: string;
}

function OrderConfirmationInner() {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState<OrderData | null>(null);

  const clearCart = useStore((s) => s.clearCart);

  useEffect(() => {
    async function load() {
      clearCart();
      // Prefer live order data from DB (works on reload / other devices)
      if (orderId) {
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          if (res.ok) {
            const json = await res.json();
            const o = json.order;
            if (o) {
              const isCod = o.payment_method === 'cod';
              setOrder({
                orderId: o.order_id,
                txnId: o.txn_id,
                name: o.customer_name,
                email: o.customer_email,
                phone: o.customer_phone,
                address: o.address,
                city: o.city,
                state: o.state,
                country: o.country,
                pincode: o.pincode,
                notes: o.notes || '',
                paymentMethod: o.payment_method,
                codFee: isCod ? 149 : 0,
                dueOnDelivery: isCod ? Math.max(0, Number(o.grand_total) - 149) : 0,
                items: (json.items || []).map((i: any) => ({
                  name: i.name,
                  price: Number(i.price),
                  quantity: i.quantity,
                  color: i.color,
                  size: i.size,
                  image: i.image,
                })),
                subtotal: Number(o.subtotal),
                discount: Number(o.discount || 0),
                shipping: Number(o.shipping || 0),
                tax: Number(o.tax || 0),
                grandTotal: Number(o.grand_total),
                placedAt: o.placed_at,
              });
              return;
            }
          }
        } catch {}
      }
      // Fallback to localStorage
      try {
        const data = localStorage.getItem('maison-noir-last-order');
        if (data) setOrder(JSON.parse(data));
      } catch {}
    }
    load();
  }, [orderId, clearCart]);

  const expectedDelivery = new Date(Date.now() + 5 * 86400000);

  const downloadInvoice = () => {
    if (!order) return;
    const lines = [
      'DEEVUH - INVOICE',
      '========================',
      `Order ID: ${order.orderId}`,
      `Transaction ID: ${order.txnId}`,
      `Date: ${formatDate(order.placedAt)}`,
      '',
      'Customer:',
      `${order.name}`,
      `${order.address}, ${order.city}, ${order.state}`,
      `${order.country} - ${order.pincode}`,
      `Phone: ${order.phone}`,
      `Email: ${order.email}`,
      '',
      'Items:',
      ...order.items.map((i) => `  ${i.name} (${i.size}) x${i.quantity} - ${formatPrice(i.price * i.quantity)}`),
      '',
      `Subtotal: ${formatPrice(order.subtotal)}`,
      order.discount > 0 ? `Discount: -${formatPrice(order.discount)}` : '',
      `Shipping: ${order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}`,
      `GST: ${formatPrice(order.tax)}`,
      `Grand Total: ${formatPrice(order.grandTotal)}`,
      isCod ? `COD Fee Paid Now: ${formatPrice(order.codFee ?? 0)}` : '',
      isCod ? `Balance Due on Delivery: ${formatPrice(order.dueOnDelivery ?? 0)}` : '',
      '',
      'Payment Method: ' + order.paymentMethod.toUpperCase(),
      isCod ? 'Payment Status: COD CONFIRMED (₹149 fee paid, balance on delivery)' : 'Payment Status: PAID',
      '',
      'Thank you for shopping with DEEVUH.',
    ].filter(Boolean).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!order) {
    return (
      <SiteShell>
        <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="font-display text-3xl">Order Not Found</p>
          <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t find this order.</p>
          <Link href="/shop" className="btn-lux mt-6 bg-foreground text-background">Continue Shopping</Link>
        </div>
      </SiteShell>
    );
  }

  const isCod = order.paymentMethod === 'cod';

  return (
    <SiteShell>
      <div className="container-lux py-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-white">
            <Check className="h-10 w-10" strokeWidth={2} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-center">
            <h1 className="heading-2">{isCod ? 'COD Order Confirmed' : 'Order Confirmed'}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {isCod
                ? `Thank you, ${order.name.split(' ')[0]}. Your COD order is confirmed. Balance of ${formatPrice(order.dueOnDelivery ?? 0)} payable in cash on delivery.`
                : `Thank you, ${order.name.split(' ')[0]}. Your order has been placed successfully.`}
            </p>
            <p className="mt-2 font-display text-lg tracking-wider">{order.orderId}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex items-center justify-center gap-6 rounded-2xl bg-secondary p-5 text-center">
            <div><Package className="mx-auto h-5 w-5 text-muted-foreground" strokeWidth={1.5} /><p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">Expected Delivery</p><p className="mt-1 text-sm font-medium">{formatDate(expectedDelivery)}</p></div>
            <div className="h-8 w-px bg-border" />
            <div><Mail className="mx-auto h-5 w-5 text-muted-foreground" strokeWidth={1.5} /><p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">Confirmation</p><p className="mt-1 text-sm font-medium">Email Sent</p></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg">Order Details</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 border-b border-border/50 pb-3 last:border-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-16 w-14 rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Size {item.size} · Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>{formatPrice(order.tax)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-medium"><span>Grand Total</span><span>{formatPrice(order.grandTotal)}</span></div>
              {isCod && (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">COD Fee Paid Now</span><span className="font-medium text-success">{formatPrice(order.codFee ?? 0)}</span></div>
                  <div className="flex justify-between rounded-lg bg-warning/10 p-2 text-warning"><span className="font-medium">Balance Due on Delivery</span><span className="font-medium">{formatPrice(order.dueOnDelivery ?? 0)}</span></div>
                </>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
              <p className="eyebrow mb-2">Shipping To</p>
              <p>{order.name}</p>
              <p className="text-muted-foreground">{order.address}, {order.city}, {order.state}</p>
              <p className="text-muted-foreground">{order.country} - {order.pincode}</p>
              <p className="mt-2 text-muted-foreground">Phone: {order.phone}</p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-4 text-sm">
              <div><p className="eyebrow">Transaction ID</p><p className="mt-1 font-mono text-xs">{order.txnId}</p></div>
              <div>
                <p className="eyebrow">Payment</p>
                <p className={`mt-1 font-medium ${isCod ? 'text-warning' : 'text-success'}`}>
                  {isCod ? 'COD Confirmed' : 'Paid'}
                </p>
                {isCod && <p className="mt-0.5 text-xs text-muted-foreground">{formatPrice(order.codFee ?? 0)} paid · {formatPrice(order.dueOnDelivery ?? 0)} on delivery</p>}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={downloadInvoice} className="btn-lux flex-1 border border-foreground"><Download className="h-4 w-4" /> Download Invoice</button>
            <Link href="/shop" className="btn-lux flex-1 bg-foreground text-background"><Home className="h-4 w-4" /> Continue Shopping <ArrowRight className="h-3.5 w-3.5" /></Link>
          </motion.div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            A confirmation email has been sent to {order.email}.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OrderConfirmationInner />
    </Suspense>
  );
}
