import './globals.css';
import type {Metadata, Viewport} from 'next';

export const metadata: Metadata = {
 title: 'MINIFY MARKET | Uganda Marketplace',
 description: 'Buy and sell vehicles, property, electronics, fashion, services, jobs and more across Uganda.',
 icons: {icon: '/logo-market.png'},
};

export const viewport: Viewport = {
 width: 'device-width',
 initialScale: 1,
 viewportFit: 'cover',
 themeColor: '#087f5b',
};

export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body>{children}</body></html>;
}
