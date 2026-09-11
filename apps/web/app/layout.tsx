import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MINIFY MARKET | Uganda Gadget Marketplace',
  description: 'Buy and sell phones, laptops, TVs, accessories and more across Uganda.',
  icons: { icon: '/logo-market.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
