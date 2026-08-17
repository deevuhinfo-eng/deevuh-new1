import { PolicyPage } from '@/components/policy-page';

const sections = [
  { heading: 'Information We Collect', body: 'We collect information you provide directly to us, such as your name, email, shipping address, and payment details when you place an order. We also automatically collect certain data about your device and browsing behavior, including IP address, browser type, and pages visited.' },
  { heading: 'How We Use Your Information', body: 'We use your information to process orders, communicate with you about your purchases, provide customer support, send marketing communications (with your consent), and improve our website and services. We do not sell your personal information to third parties.' },
  { heading: 'Data Security', body: 'We implement industry-standard security measures including 256-bit SSL encryption for all transactions. Payment information is processed through Razorpay, which is PCI-DSS compliant. We do not store full credit card details on our servers.' },
  { heading: 'Cookies', body: 'We use cookies to remember your preferences, analyze website traffic, and improve your shopping experience. You can control cookies through your browser settings, though disabling them may affect website functionality.' },
  { heading: 'Your Rights', body: 'You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly.' },
  { heading: 'Contact Us', body: 'For privacy-related inquiries, please contact us at deevuhinfo@gmail.com. We will respond to your request within 30 days.' },
];

export default function PrivacyPage() {
  return <PolicyPage eyebrow="Legal" title="Privacy Policy" sections={sections} />;
}
