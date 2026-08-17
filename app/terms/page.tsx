import { PolicyPage } from '@/components/policy-page';

const sections = [
  { heading: 'Acceptance of Terms', body: 'By accessing and using the DEEVUH website, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website or services.' },
  { heading: 'Product Information', body: 'We strive to display our products accurately, including colors, materials, and sizing. However, we cannot guarantee that your device will display colors exactly as intended. All product descriptions are provided in good faith.' },
  { heading: 'Pricing and Payment', body: 'All prices are listed in USD and are subject to change without notice. We reserve the right to correct pricing errors. Payment is processed securely through Razorpay. Orders are not confirmed until payment is verified.' },
  { heading: 'Intellectual Property', body: 'All content on this website, including text, images, logos, and designs, is the property of DEEVUH and protected by intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.' },
  { heading: 'Limitation of Liability', body: 'DEEVUH is not liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our liability is limited to the value of your purchase.' },
  { heading: 'Changes to Terms', body: 'We reserve the right to update these Terms and Conditions at any time. Changes take effect immediately upon posting. Continued use of our website constitutes acceptance of the updated terms.' },
  { heading: 'Governing Law', body: 'These terms are governed by the laws of the State of New York. Any disputes shall be resolved in the courts of New York County.' },
];

export default function TermsPage() {
  return <PolicyPage eyebrow="Legal" title="Terms & Conditions" sections={sections} />;
}
