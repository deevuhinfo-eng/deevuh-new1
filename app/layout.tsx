import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://deevuh.in'),
  title: { default: 'DEEVUH — Modern Luxury Atelier', template: '%s · DEEVUH' },
  description:
    'DEEVUH is a modern luxury clothing atelier. Limited-edition garments crafted with uncompromising quality and timeless design.',
  keywords: ['luxury fashion', 'designer clothing', 'premium apparel', 'atelier', 'minimalist fashion'],
  manifest: '/manifest.webmanifest',
  authors: [{ name: 'DEEVUH' }],
  openGraph: {
    type: 'website',
    title: 'DEEVUH — Modern Luxury Atelier',
    description: 'Limited-edition luxury garments crafted with uncompromising quality.',
    siteName: 'DEEVUH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEEVUH — Modern Luxury Atelier',
    description: 'Limited-edition luxury garments crafted with uncompromising quality.',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0b08' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
