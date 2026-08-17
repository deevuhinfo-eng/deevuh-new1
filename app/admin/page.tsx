'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, DollarSign, Package, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { products } from '@/lib/products';
import { formatPrice, formatDate, timeAgo } from '@/lib/format';

interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  grandTotal: number;
  orderStatus: string;
  placedAt: string;
  items: { name: string; quantity: number; price: number }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (json.orders?.length) {
          const mapped = json.orders.map((o: any) => ({
            orderId: o.order_id,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: o.customer_phone,
            grandTotal: o.grand_total,
            orderStatus: o.order_status,
            placedAt: o.placed_at,
            items: [],
          }));
          setOrders(mapped);
          return;
        }
      } catch {}
      try {
        const stored = JSON.parse(localStorage.getItem('maison-noir-orders') || '[]');
        setOrders(stored);
      } catch {}
    }
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled').length;
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.placedAt).toDateString() === today).length;
  const weekAgo = Date.now() - 7 * 86400000;
  const weeklyOrders = orders.filter((o) => new Date(o.placedAt).getTime() > weekAgo).length;
  const monthAgo = Date.now() - 30 * 86400000;
  const monthlyOrders = orders.filter((o) => new Date(o.placedAt).getTime() > monthAgo).length;
  const customers = new Set(orders.map((o) => o.customerEmail)).size;
  const bestSeller = products.find((p) => p.bestSeller);
  const visibleProducts = products.filter((p) => !p.hidden).length;

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-success' },
    { label: "Today's Orders", value: todayOrders, icon: Clock, color: 'text-foreground' },
    { label: 'Weekly Orders', value: weeklyOrders, icon: TrendingUp, color: 'text-foreground' },
    { label: 'Monthly Orders', value: monthlyOrders, icon: ShoppingBag, color: 'text-foreground' },
    { label: 'Pending Orders', value: pendingOrders, icon: Package, color: 'text-warning' },
    { label: 'Completed', value: completedOrders, icon: CheckCircle, color: 'text-success' },
    { label: 'Cancelled', value: cancelledOrders, icon: XCircle, color: 'text-destructive' },
    { label: 'Customers', value: customers, icon: Users, color: 'text-foreground' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your atelier performance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-background p-5"
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
            <p className="mt-3 font-display text-2xl">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Recent Orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">View All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1} />
              <p className="mt-4 text-sm text-muted-foreground">No orders yet. Orders will appear here once customers check out.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.orderId} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.orderId} · {timeAgo(order.placedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(order.grandTotal)}</p>
                    <span className={`text-xs capitalize ${order.orderStatus === 'delivered' ? 'text-success' : order.orderStatus === 'cancelled' ? 'text-destructive' : 'text-warning'}`}>{order.orderStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6">
            <h2 className="font-display text-lg">Best Seller</h2>
            {bestSeller && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bestSeller.images[0].url} alt={bestSeller.name} className="h-32 w-full rounded-lg object-cover" />
                <p className="mt-3 text-sm font-medium">{bestSeller.name}</p>
                <p className="text-xs text-muted-foreground">{bestSeller.reviewCount} reviews · {formatPrice(bestSeller.price)}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background p-6">
            <h2 className="font-display text-lg">Inventory</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Active Products</span><span className="font-medium">{visibleProducts}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Low Stock</span><span className="font-medium text-warning">{products.filter((p) => p.stock <= 5 && p.stock > 0).length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Out of Stock</span><span className="font-medium text-destructive">{products.filter((p) => p.stock === 0).length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">On Sale</span><span className="font-medium text-success">{products.filter((p) => p.saleEnabled).length}</span></div>
            </div>
            <Link href="/admin/products" className="mt-4 flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">Manage Products <ArrowRight className="h-3 w-3" /></Link>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="font-display text-lg">Latest Payments</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.orderId} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{order.orderId}</td>
                    <td className="py-3 pr-4">{order.customerName}</td>
                    <td className="py-3 pr-4 font-medium">{formatPrice(order.grandTotal)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(order.placedAt)}</td>
                    <td className="py-3"><span className="rounded-full bg-success/10 px-2 py-1 text-xs text-success">Paid</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
