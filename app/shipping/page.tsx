import { PolicyPage } from '@/components/policy-page';

const sections = [
  { heading: 'Processing Time', body: 'Orders are processed within 1-2 business days of placement. During peak periods and sales events, processing may take up to 3 business days. You will receive a confirmation email with tracking information once your order ships.' },
  { heading: 'Domestic Shipping', body: 'Standard shipping (3-5 business days): $14. Express shipping (1-2 business days): $28. Complimentary express shipping is included on all orders over $250. All domestic shipments include tracking and insurance.' },
  { heading: 'International Shipping', body: 'We ship worldwide with carbon-neutral delivery. International shipping costs are calculated at checkout based on destination and weight. Delivery times range from 7-14 business days depending on location. Duties and taxes may apply.' },
  { heading: 'Order Tracking', body: 'Once your order ships, you will receive an email with a tracking number. You can track your package through the carrier website. For order status inquiries, contact us at deevuhinfo@gmail.com.' },
  { heading: 'Shipping Restrictions', body: 'Some items may have shipping restrictions due to material regulations (e.g., exotic leather). These restrictions are noted on the product page. We are unable to ship to PO boxes for express deliveries.' },
  { heading: 'Lost or Delayed Packages', body: 'If your package is lost or significantly delayed, please contact us. We will work with the carrier to locate your package and arrange a replacement or refund if necessary. Claims must be filed within 30 days of the expected delivery date.' },
];

export default function ShippingPage() {
  return <PolicyPage eyebrow="Legal" title="Shipping Policy" sections={sections} />;
}
