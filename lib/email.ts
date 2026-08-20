import { Resend } from 'resend';
import { siteConfig as fallbackConfig } from './config';
import { formatPrice, formatDate } from './format';

interface OrderEmailData {
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
  paymentMethod: string;
  codFee?: number;
  dueOnDelivery?: number;
  items: { name: string; price: number; quantity: number; color: string; size: string; image: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getFromAddress(): string {
  const domain = process.env.RESEND_DOMAIN || 'confirmation.deevuh.in';
  return `DEEVUH <orders@${domain}>`;
}

function getBrand(): { email: string; brand: string; address: string } {
  return {
    email: fallbackConfig.email,
    brand: fallbackConfig.brand,
    address: fallbackConfig.address,
  };
}

function itemRows(items: OrderEmailData['items']): string {
  return items.map((i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eee" colspan="2">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="60" style="vertical-align:top;padding-right:12px">
              <img src="${i.image}" alt="${i.name}" width="60" height="72" style="border-radius:8px;object-fit:cover;display:block;width:60px;height:72px">
            </td>
            <td style="vertical-align:top;font-size:14px">
              <strong style="display:block;margin-bottom:2px">${i.name}</strong>
              <span style="color:#888;font-size:12px">Size ${i.size} · Qty ${i.quantity}</span>
            </td>
            <td width="80" style="vertical-align:top;text-align:right;font-size:14px;font-weight:600;white-space:nowrap">
              ${formatPrice(i.price * i.quantity)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');
}

function merchantEmail(order: string) {
  const brand = getBrand();
  return brand.email;
}

function customerEmailHtml(order: OrderEmailData, brand: { email: string; brand: string; address: string }): string {
  const isCod = order.paymentMethod === 'cod';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
        <tr><td style="background:#000;padding:36px 40px;text-align:center">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr><td style="background:#22c55e;width:48px;height:48px;border-radius:50%;text-align:center;vertical-align:middle;font-size:24px;line-height:48px;color:#fff;font-weight:700">✓</td></tr>
          </table>
          <h1 style="color:#fff;margin:16px 0 4px;font-size:18px;letter-spacing:3px;font-weight:300">${isCod ? 'COD ORDER CONFIRMED' : 'PAYMENT CONFIRMED'}</h1>
          <p style="color:#aaa;margin:0;font-size:13px;letter-spacing:1px">Thank you, ${order.name.split(' ')[0]}</p>
        </td></tr>
        <tr><td style="padding:32px 40px 0">
          <p style="font-size:14px;color:#555;margin:0 0 24px;line-height:1.6">
            ${isCod
              ? `Your Cash on Delivery order is confirmed. A COD fee of ${formatPrice(order.codFee ?? 0)} has been paid and the balance of ${formatPrice(order.dueOnDelivery ?? 0)} is payable in cash on delivery.`
              : "Your payment has been received. We're preparing your pieces with care and will notify you when they ship."}
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="padding:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#888">Items Ordered</td></tr>
            ${itemRows(order.items)}
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px">
            <tr><td style="padding:4px 0;color:#888">Subtotal</td><td style="padding:4px 0;text-align:right">${formatPrice(order.subtotal)}</td></tr>
            ${order.discount > 0 ? `<tr><td style="padding:4px 0;color:#22c55e">Discount</td><td style="padding:4px 0;text-align:right;color:#22c55e">-${formatPrice(order.discount)}</td></tr>` : ''}
            <tr><td style="padding:4px 0;color:#888">Shipping</td><td style="padding:4px 0;text-align:right">${order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</td></tr>
            <tr><td style="padding:4px 0;color:#888">GST</td><td style="padding:4px 0;text-align:right">${formatPrice(order.tax)}</td></tr>
            ${isCod ? `<tr><td style="padding:4px 0;color:#888">COD Fee (paid now)</td><td style="padding:4px 0;text-align:right">${formatPrice(order.codFee ?? 0)}</td></tr><tr><td style="padding:4px 0;color:#d97706">Balance Due on Delivery</td><td style="padding:4px 0;text-align:right;color:#d97706">${formatPrice(order.dueOnDelivery ?? 0)}</td></tr>` : ''}
            <tr><td style="padding:12px 0 4px;border-top:2px solid #000;font-weight:600">${isCod ? 'Order Total' : 'Total Paid'}</td><td style="padding:12px 0 4px;border-top:2px solid #000;font-weight:600;text-align:right">${formatPrice(order.grandTotal)}</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:16px;border:1px solid #bbf7d0">
            <tr>
              <td style="font-size:11px;color:#166534;letter-spacing:1px;text-transform:uppercase;padding-bottom:8px">Order ID</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:700;color:#166534;padding-bottom:12px">${order.orderId}</td>
            </tr>
            <tr>
              <td>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${isCod ? '#d97706' : '#22c55e'};border-radius:4px;padding:3px 10px;font-size:11px;font-weight:600;color:#fff;letter-spacing:0.5px">${isCod ? 'COD CONFIRMED' : 'PAID'}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="padding-top:14px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#e5e5e5;border-radius:6px;height:6px;overflow:hidden">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr><td width="33%" style="background:#22c55e;border-radius:6px;height:6px"></td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:8px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:11px;color:#22c55e;font-weight:600;text-align:left">● Preparing</td>
                        <td style="font-size:11px;color:#aaa;text-align:center">Shipped</td>
                        <td style="font-size:11px;color:#aaa;text-align:right">Delivered</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 32px">
          <h2 style="font-size:12px;margin:0 0 8px;letter-spacing:1px;text-transform:uppercase;color:#888">Shipping To</h2>
          <p style="font-size:14px;color:#555;margin:0;line-height:1.5">${order.name}<br>${order.address}, ${order.city}, ${order.state}<br>${order.country} - ${order.pincode}<br>Phone: ${order.phone}</p>
        </td></tr>

        <tr><td style="padding:0 40px 32px">
          <p style="font-size:13px;color:#888;margin:0;line-height:1.6;border-top:1px solid #eee;padding-top:24px">
            Need help? Contact us at <a href="mailto:${brand.email}" style="color:#000;text-decoration:none;font-weight:500">${brand.email}</a>
          </p>
        </td></tr>

        <tr><td style="background:#f8f8f8;padding:24px 40px;text-align:center;font-size:11px;color:#aaa">
          ${brand.brand} · ${brand.address}<br>
          &copy; ${new Date().getFullYear()} ${brand.brand}. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function merchantEmailHtml(order: OrderEmailData, brand: { email: string; brand: string; address: string }): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
        <tr><td style="background:#000;padding:36px 40px;text-align:center">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr><td style="background:#f59e0b;width:48px;height:48px;border-radius:50%;text-align:center;vertical-align:middle;font-size:20px;line-height:48px;color:#fff;font-weight:700">🆕</td></tr>
          </table>
          <h1 style="color:#fff;margin:16px 0 4px;font-size:18px;letter-spacing:3px;font-weight:300">NEW ORDER RECEIVED</h1>
          <p style="color:#f59e0b;margin:0;font-size:13px;letter-spacing:1px">${formatPrice(order.grandTotal)}</p>
        </td></tr>
        <tr><td style="padding:32px 40px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid #fde68a">
            <tr>
              <td style="font-size:11px;color:#92400e;letter-spacing:1px;text-transform:uppercase;padding-bottom:4px">Order ID</td>
            </tr>
            <tr>
              <td style="font-size:20px;font-weight:700;color:#92400e">${order.orderId}</td>
            </tr>
          </table>

          <h2 style="font-size:12px;margin:0 0 12px;letter-spacing:1px;text-transform:uppercase;color:#888">Customer Details</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:24px;background:#f8f8f8;border-radius:12px;padding:16px">
            <tr><td style="padding:4px 0;color:#888;width:80px">Name</td><td style="padding:4px 0;font-weight:500">${order.name}</td></tr>
            <tr><td style="padding:4px 0;color:#888">Email</td><td style="padding:4px 0"><a href="mailto:${order.email}" style="color:#000;font-weight:500">${order.email}</a></td></tr>
            <tr><td style="padding:4px 0;color:#888">Phone</td><td style="padding:4px 0;font-weight:500">${order.phone}</td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="padding:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#888">Items Ordered</td></tr>
            ${itemRows(order.items)}
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px">
            <tr><td style="padding:4px 0;color:#888">Subtotal</td><td style="padding:4px 0;text-align:right">${formatPrice(order.subtotal)}</td></tr>
            ${order.discount > 0 ? `<tr><td style="padding:4px 0;color:#22c55e">Discount</td><td style="padding:4px 0;text-align:right;color:#22c55e">-${formatPrice(order.discount)}</td></tr>` : ''}
            <tr><td style="padding:4px 0;color:#888">Shipping</td><td style="padding:4px 0;text-align:right">${order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</td></tr>
            <tr><td style="padding:4px 0;color:#888">GST</td><td style="padding:4px 0;text-align:right">${formatPrice(order.tax)}</td></tr>
            <tr><td style="padding:12px 0 4px;border-top:2px solid #000;font-weight:600">Total</td><td style="padding:12px 0 4px;border-top:2px solid #000;font-weight:600;text-align:right">${formatPrice(order.grandTotal)}</td></tr>
          </table>

          <h2 style="font-size:12px;margin:24px 0 8px;letter-spacing:1px;text-transform:uppercase;color:#888">Shipping Address</h2>
          <p style="font-size:14px;color:#555;margin:0 0 24px;line-height:1.5">${order.address}, ${order.city}, ${order.state}<br>${order.country} - ${order.pincode}</p>
        </td></tr>

        <tr><td style="background:#f8f8f8;padding:24px 40px;text-align:center;font-size:11px;color:#aaa">
          ${brand.brand} · ${brand.address}<br>
          &copy; ${new Date().getFullYear()} ${brand.brand}. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendCustomerOrderConfirmation(order: OrderEmailData, brand?: { email: string; brand: string; address: string }): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { success: false, error: 'RESEND_API_KEY not configured' };

  const b = brand || getBrand();
  try {
    await resend.emails.send({
      from: getFromAddress(),
      to: order.email,
      subject: `Order Confirmed — ${order.orderId}`,
      html: customerEmailHtml(order, b),
    });
    return { success: true };
  } catch (e: any) {
    console.error('[Email] Failed to send customer confirmation:', e);
    return { success: false, error: e.message };
  }
}

export async function sendMerchantOrderNotification(order: OrderEmailData, merchantEmail?: string, brand?: { email: string; brand: string; address: string }): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { success: false, error: 'RESEND_API_KEY not configured' };

  const to = merchantEmail || getBrand().email;
  const b = brand || getBrand();
  try {
    await resend.emails.send({
      from: getFromAddress(),
      to,
      subject: `New Order — ${order.orderId} — ${formatPrice(order.grandTotal)}`,
      html: merchantEmailHtml(order, b),
    });
    return { success: true };
  } catch (e: any) {
    console.error('[Email] Failed to send merchant notification:', e);
    return { success: false, error: e.message };
  }
}

const STATUS_EMAILS: Record<string, { subject: string; heading: string; message: string; badge: string; badgeColor: string; icon: string }> = {
  packing: {
    subject: 'Your Order is Being Packed',
    heading: 'ORDER BEING PACKED',
    message: "We're carefully packing your pieces with the love they deserve. They'll be shipped to you very soon.",
    badge: 'PACKING',
    badgeColor: '#6366f1',
    icon: '📦',
  },
  shipped: {
    subject: 'Your Order Has Been Shipped 🚚',
    heading: 'YOUR ORDER HAS SHIPPED',
    message: `Good news — your order is on its way! Expected delivery around ${formatDate(Date.now() + 4 * 86400000)}.`,
    badge: 'SHIPPED',
    badgeColor: '#22c55e',
    icon: '🚚',
  },
  delivered: {
    subject: 'Your Order Has Been Delivered ✅',
    heading: 'YOUR ORDER IS DELIVERED',
    message: 'Your order has been delivered. We hope you love your new pieces as much as we do. Enjoy!',
    badge: 'DELIVERED',
    badgeColor: '#22c55e',
    icon: '✅',
  },
  cancelled: {
    subject: 'Your Order Was Cancelled',
    heading: 'ORDER CANCELLED',
    message: 'Your order has been cancelled. If you were charged, a refund will be initiated shortly (3-5 business days).',
    badge: 'CANCELLED',
    badgeColor: '#ef4444',
    icon: '✕',
  },
  refunded: {
    subject: 'Your Refund Has Been Processed',
    heading: 'REFUND PROCESSED',
    message: 'Your refund has been processed successfully. It may take 3-5 business days to reflect in your account.',
    badge: 'REFUNDED',
    badgeColor: '#f59e0b',
    icon: '↵',
  },
};

function statusEmailHtml(order: OrderEmailData, status: string, brand: { email: string; brand: string; address: string }): string {
  const meta = STATUS_EMAILS[status] || STATUS_EMAILS.shipped;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
        <tr><td style="background:#000;padding:36px 40px;text-align:center">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr><td style="background:${meta.badgeColor};width:48px;height:48px;border-radius:50%;text-align:center;vertical-align:middle;font-size:22px;line-height:48px;color:#fff;font-weight:700">${meta.icon}</td></tr>
          </table>
          <h1 style="color:#fff;margin:16px 0 4px;font-size:18px;letter-spacing:3px;font-weight:300">${meta.heading}</h1>
          <p style="color:#aaa;margin:0;font-size:13px;letter-spacing:1px">Hi ${order.name.split(' ')[0]}</p>
        </td></tr>
        <tr><td style="padding:32px 40px 0">
          <p style="font-size:14px;color:#555;margin:0 0 24px;line-height:1.6">${meta.message}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="padding:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#888">Items Ordered</td></tr>
            ${itemRows(order.items)}
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px">
            <tr><td style="padding:12px 0 4px;border-top:2px solid #000;font-weight:600">Order Total</td><td style="padding:12px 0 4px;border-top:2px solid #000;font-weight:600;text-align:right">${formatPrice(order.grandTotal)}</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0">
            <tr>
              <td style="font-size:11px;color:#64748b;letter-spacing:1px;text-transform:uppercase;padding-bottom:4px">Order ID</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:700;color:#0f172a;padding-bottom:10px">${order.orderId}</td>
            </tr>
            <tr>
              <td>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr><td style="background:${meta.badgeColor};border-radius:4px;padding:3px 10px;font-size:11px;font-weight:600;color:#fff;letter-spacing:0.5px">${meta.badge}</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 32px">
          <h2 style="font-size:12px;margin:0 0 8px;letter-spacing:1px;text-transform:uppercase;color:#888">Shipping To</h2>
          <p style="font-size:14px;color:#555;margin:0;line-height:1.5">${order.name}<br>${order.address}, ${order.city}, ${order.state}<br>${order.country} - ${order.pincode}<br>Phone: ${order.phone}</p>
        </td></tr>

        <tr><td style="padding:0 40px 32px">
          <p style="font-size:13px;color:#888;margin:0;line-height:1.6;border-top:1px solid #eee;padding-top:24px">
            Need help? Contact us at <a href="mailto:${brand.email}" style="color:#000;text-decoration:none;font-weight:500">${brand.email}</a>
          </p>
        </td></tr>

        <tr><td style="background:#f8f8f8;padding:24px 40px;text-align:center;font-size:11px;color:#aaa">
          ${brand.brand} · ${brand.address}<br>
          &copy; ${new Date().getFullYear()} ${brand.brand}. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderStatusEmail(order: OrderEmailData, status: string, brand?: { email: string; brand: string; address: string }): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { success: false, error: 'RESEND_API_KEY not configured' };
  const meta = STATUS_EMAILS[status];
  if (!meta) return { success: false, error: `No email template for status "${status}"` };

  const b = brand || getBrand();
  try {
    await resend.emails.send({
      from: getFromAddress(),
      to: order.email,
      subject: `${meta.subject} — ${order.orderId}`,
      html: statusEmailHtml(order, status, b),
    });
    return { success: true };
  } catch (e: any) {
    console.error(`[Email] Failed to send status email (${status}):`, e);
    return { success: false, error: e.message };
  }
}
