import type { Metadata, Viewport } from 'next';
import '@fontsource/manrope/cyrillic-400.css';
import '@fontsource/manrope/cyrillic-500.css';
import '@fontsource/manrope/cyrillic-600.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/cormorant-garamond/cyrillic-400.css';
import '@fontsource/cormorant-garamond/cyrillic-400-italic.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import './globals.css';
import { studio } from '@/content/studio';
import { seo } from '@/content/seo';
import { isPublishable } from '@/lib/readiness';
import { AppProvider } from '@/components/app-provider';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/sections';
import { SelectedReference } from '@/components/selected-reference';

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl || 'http://localhost:3000'),
  title: { default: `${seo.title} | ${studio.brand}`, template: `%s | ${studio.brand}` },
  description: seo.description,
  robots: { index: isPublishable, follow: isPublishable },
  openGraph: { type: 'website', locale: seo.locale, siteName: studio.brand, title: seo.title, description: seo.description, images: [{ url: '/og.png', width: 1200, height: 630, alt: studio.tagline }] },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f8f6f1' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><a className="skip-link" href="#main">Перейти к содержимому</a><AppProvider><Navigation /><SelectedReference />{children}<Footer /></AppProvider></body></html>;
}
