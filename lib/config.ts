import type { SiteConfig, Coupon, Review } from './types';

export const siteConfig: SiteConfig = {
  brand: 'DEEVUH',
  tagline: 'Modern Luxury Atelier',
  email: 'deevuhinfo@gmail.com',
  phone: '+91 78275 37480',
  whatsapp: '+917827537480',
  address: 'deevuh.in',
  social: {
    instagram: 'https://www.instagram.com/deevuh.in?igsh=MTMyZ3I5cm16dWdtaA==',
    facebook: 'https://www.facebook.com/share/1BbiqtTJiR/?mibextid=wwXIfr',
    pinterest: 'https://pinterest.com',
    youtube: 'https://youtube.com',
  },
  shipping: { freeThreshold: 20000, standardCharge: 500, expressCharge: 1000 },
  tax: { gstRate: 5, enabled: true },
  cod: { enabled: true, fee: 149 },
  hero: {
    videoUrl:
      'https://cdn.coverr.co/videos/coverr-a-woman-in-a-white-dress-walking-on-the-beach-1572/1080p.mp4',
    poster:
      'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'The Art of Quiet Luxury',
    subheadline:
      'Limited-edition garments, crafted in small batches with materials sourced from the world\u2019s finest mills.',
  },
  freeShippingBanner: 'Complimentary express shipping on all orders over ₹20,000',
};

export const coupons: Coupon[] = [
  { code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 0, active: true, description: '10% off your first order' },
  { code: 'NOIR25', type: 'fixed', value: 2000, minSubtotal: 12000, active: true, description: '₹2,000 off orders over ₹12,000' },
  { code: 'VIP20', type: 'percent', value: 20, minSubtotal: 25000, active: true, description: '20% off orders over ₹25,000' },
];

export const reviews: Review[] = [
  { id: 'r1', name: 'Eleanor V.', location: 'London, UK', rating: 5, title: 'Effortlessly elegant', body: 'The cashmere is impossibly soft and the cut is perfection. This is the only label I trust for elevated essentials.', date: '2025-11-04', verified: true },
  { id: 'r2', name: 'Marcus T.', location: 'Tokyo, JP', rating: 5, title: 'Quietly exceptional', body: 'Every detail is considered. The packaging alone feels like a gift. Worth every penny.', date: '2025-10-22', verified: true },
  { id: 'r3', name: 'Sofia R.', location: 'Milan, IT', rating: 5, title: 'My new uniform', body: 'I have worn the wool overcoat nearly every day this winter. Timeless and beautifully structured.', date: '2025-10-15', verified: true },
  { id: 'r4', name: 'James L.', location: 'New York, US', rating: 5, title: 'Discreet luxury done right', body: 'No loud logos, just incredible fabric and tailoring. Exactly what quiet luxury should be.', date: '2025-09-30', verified: true },
  { id: 'r5', name: 'Amara K.', location: 'Paris, FR', rating: 5, title: 'Exquisite craftsmanship', body: 'The silk drapes beautifully and the color is even richer in person. A true investment piece.', date: '2025-09-18', verified: true },
  { id: 'r6', name: 'Daniel W.', location: 'Berlin, DE', rating: 5, title: 'Better than the big houses', body: 'I own pieces from the major luxury brands and DEEVUH outclasses them in quality and restraint.', date: '2025-09-02', verified: true },
];

export const faqs = [
  { q: 'How long does shipping take?', a: 'Standard orders ship within 1-2 business days and arrive in 3-5 business days. Express delivery is available at checkout.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery on unworn items with original tags. Refunds are issued as store credit valid for 1 year, after deducting a ₹150 delivery and handling fee.' },
  { q: 'Are your garments true to size?', a: 'Most pieces run true to size. Each product page includes a detailed fit guide and specifications. Contact us for personalized sizing advice.' },
  { q: 'How should I care for my pieces?', a: 'Care instructions are listed on each product page and on the garment label. We recommend professional cleaning for tailored and silk items.' },
  { q: 'Do you offer international shipping?', a: 'Yes, we ship worldwide with carbon-neutral delivery. Duties and taxes may apply depending on your destination.' },
  { q: 'Are your materials sustainably sourced?', a: 'We partner with mills that hold certifications for responsible sourcing. Our wool is mulesing-free and our cotton is GOTS-certified organic.' },
];
