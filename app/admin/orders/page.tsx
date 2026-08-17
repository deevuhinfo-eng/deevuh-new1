'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Eye, X, Package, Truck, CheckCircle, XCircle, RotateCcw, Clock, Trash2, Mail } from 'lucide-react';
import { formatPrice, formatDate, timeAgo } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Order {
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
  items: { name: string; price: number; quantity: number; color: string; size: string; image: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  placedAt: string;
  orderStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

const statusOptions = [
  { value: 'pending', label: 'Payment Pending', icon: Clock, color: 'text-warning' },
  { value: 'packing', label: 'Packing', icon: Package, color: 'text-foreground' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-foreground' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-success' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-destructive' },
  { value: 'refunded', label: 'Refunded', icon: RotateCcw, color: 'text-muted-foreground' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (json.orders?.length) {
          const mapped = json.orders.map((o: any) => ({
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
            notes: o.notes,
            paymentMethod: o.payment_method,
            items: [],
            subtotal: o.subtotal,
            discount: o.discount,
            shipping: o.shipping,
            tax: o.tax,
            grandTotal: o.grand_total,
            placedAt: o.placed_at,
            orderStatus: o.order_status,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: o.customer_phone,
          }));
          setOrders(mapped);
          return;
        }
      } catch {}
      // Fallback to localStorage
      try { setOrders(JSON.parse(localStorage.getItem('maison-noir-orders') || '[]')); } catch {}
    }
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {}
    setOrders((prev) => {
      const updated = prev.map((o) => o.orderId === orderId ? { ...o, orderStatus: status } : o);
      try { localStorage.setItem('maison-noir-orders', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setSelected((s) => s ? { ...s, orderStatus: status } : null);
    toast.success('Order status updated');
  };

  const deleteOrder = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/orders/${deleteTarget.orderId}`, { method: 'DELETE' });
      setOrders((prev) => {
        const updated = prev.filter((o) => o.orderId !== deleteTarget.orderId);
        try { localStorage.setItem('maison-noir-orders', JSON.stringify(updated)); } catch {}
        return updated;
      });
      if (selected?.orderId === deleteTarget.orderId) setSelected(null);
      toast.success('Order deleted');
    } catch {
      toast.error('Failed to delete order');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const resendEmail = async (order: Order) => {
    setResendingId(order.orderId);
    try {
      const res = await fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      if (json.customer?.success && json.merchant?.success) {
        toast.success('Emails sent to customer & merchant');
      } else {
        toast.warning(`Customer: ${json.customer?.success ? 'sent' : json.customer?.error || 'failed'} · Merchant: ${json.merchant?.success ? 'sent' : json.merchant?.error || 'failed'}`);
      }
    } catch {
      toast.error('Failed to send emails');
    } finally {
      setResendingId(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter);

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Date', 'Payment Method'];
    const rows = orders.map((o) => [o.orderId, o.customerName || o.name, o.customerEmail || o.email, o.customerPhone || o.phone, o.grandTotal, o.orderStatus, formatDate(o.placedAt), o.paymentMethod]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported');
  };

  const exportInvoice = (order: Order) => {
    const lines = [
      'DEEVUH - INVOICE',
      '========================',
      `Order ID: ${order.orderId}`,
      `Transaction ID: ${order.txnId}`,
      `Date: ${formatDate(order.placedAt)}`,
      `Status: ${order.orderStatus}`,
      '',
      'Customer:',
      order.customerName || order.name,
      `${order.address}, ${order.city}, ${order.state}`,
      `${order.country} - ${order.pincode}`,
      `Phone: ${order.customerPhone || order.phone}`,
      `Email: ${order.customerEmail || order.email}`,
      '',
      'Items:',
      ...order.items.map((i) => `  ${i.name} (${i.color}, ${i.size}) x${i.quantity} - ${formatPrice(i.price * i.quantity)}`),
      '',
      `Subtotal: ${formatPrice(order.subtotal)}`,
      order.discount > 0 ? `Discount: -${formatPrice(order.discount)}` : '',
      `Shipping: ${order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}`,
      `GST: ${formatPrice(order.tax)}`,
      `Grand Total: ${formatPrice(order.grandTotal)}`,
      '',
      'Thank you for your business.',
    ].filter(Boolean).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} total orders</p>
        </div>
        <button onClick={exportCSV} disabled={orders.length === 0} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs uppercase tracking-wider transition-colors hover:bg-accent disabled:opacity-50"><Download className="h-3.5 w-3.5" /> Export CSV</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={cn('rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors', filter === 'all' ? 'bg-foreground text-background' : 'border border-border hover:bg-accent')}>All ({orders.length})</button>
        {statusOptions.map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)} className={cn('rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors', filter === s.value ? 'bg-foreground text-background' : 'border border-border hover:bg-accent')}>
            {s.label} ({orders.filter((o) => o.orderStatus === s.value).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-background py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1} />
          <p className="mt-4 text-sm text-muted-foreground">No orders found. Place a test order from the storefront checkout.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <motion.tr key={order.orderId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/50 last:border-0">
                  <td className="p-4 font-mono text-xs">{order.orderId}</td>
                  <td className="p-4">
                    <p className="font-medium">{order.customerName || order.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail || order.email}</p>
                  </td>
                  <td className="p-4 font-medium">{formatPrice(order.grandTotal)}</td>
                  <td className="p-4 text-muted-foreground">{timeAgo(order.placedAt)}</td>
                  <td className="p-4">
                    <select value={order.orderStatus} onChange={(e) => updateStatus(order.orderId, e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-xs capitalize outline-none">
                      {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(order)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent" aria-label="View"><Eye className="h-3.5 w-3.5" /></button>
                      <button onClick={() => resendEmail(order)} disabled={resendingId === order.orderId} className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent disabled:opacity-50" aria-label="Resend Email"><Mail className="h-3.5 w-3.5" /></button>
                      <button onClick={() => exportInvoice(order)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent" aria-label="Invoice"><FileText className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteTarget(order)} className="flex h-8 w-8 items-center justify-center rounded-md border border-destructive/50 text-destructive transition-colors hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl">Order Details</h2>
                <p className="font-mono text-xs text-muted-foreground">{selected.orderId}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-muted p-4">
                <p className="eyebrow mb-2">Customer</p>
                <p className="font-medium">{selected.customerName || selected.name}</p>
                <p className="text-muted-foreground">{selected.customerEmail || selected.email}</p>
                <p className="text-muted-foreground">{selected.customerPhone || selected.phone}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="eyebrow mb-2">Shipping Address</p>
                <p className="text-muted-foreground">{selected.address}, {selected.city}, {selected.state}</p>
                <p className="text-muted-foreground">{selected.country} - {selected.pincode}</p>
                {selected.notes && <p className="mt-2 text-xs italic">Notes: {selected.notes}</p>}
              </div>
              <div>
                <p className="eyebrow mb-2">Items</p>
                {selected.items.map((item, i) => (
                  <div key={i} className="flex gap-3 border-b border-border/50 py-2 last:border-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-12 w-10 rounded object-cover" />
                    <div className="flex-1"><p className="text-xs font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.color} · {item.size} · Qty {item.quantity}</p></div>
                    <p className="text-xs font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                {selected.discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-{formatPrice(selected.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{selected.shipping === 0 ? 'Free' : formatPrice(selected.shipping)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>{formatPrice(selected.tax)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-medium"><span>Total</span><span>{formatPrice(selected.grandTotal)}</span></div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <div><p className="eyebrow">Transaction ID</p><p className="mt-1 font-mono text-xs">{selected.txnId}</p></div>
                <div><p className="eyebrow">Payment</p><p className={`mt-1 font-medium ${selected.paymentMethod === 'cod' ? 'text-warning capitalize' : 'text-success capitalize'}`}>{(selected.paymentMethod === 'cod' ? 'Cash on Delivery' : selected.paymentMethod)}</p></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => exportInvoice(selected)} className="btn-lux flex-1 border border-foreground"><FileText className="h-4 w-4" /> Download Invoice</button>
                <button onClick={() => resendEmail(selected)} disabled={resendingId === selected.orderId} className="btn-lux flex-1 bg-foreground text-background disabled:opacity-50"><Mail className="h-4 w-4" /> {resendingId === selected.orderId ? 'Sending…' : 'Resend Emails'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteTarget(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-2xl bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="font-display text-xl">Delete Order?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Order <span className="font-mono text-xs text-foreground">{deleteTarget.orderId}</span> ({formatPrice(deleteTarget.grandTotal)}, {deleteTarget.customerName || deleteTarget.name}) permanently deleted from Supabase. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn-lux flex-1 border border-border">Cancel</button>
              <button onClick={deleteOrder} disabled={deleting} className="btn-lux flex-1 bg-destructive text-destructive-foreground disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Delete Order'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
