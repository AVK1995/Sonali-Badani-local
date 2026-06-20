import type { Metadata, Viewport } from 'next';
import { Fraunces, Mulish } from 'next/font/google';
import Script from 'next/script';
import { CHECKOUT_CONFIG } from '@/lib/checkout-config';
import SmoothScroll from '@/components/SmoothScroll';
import MetaPixel from '@/components/MetaPixel';
import './globals.css';

/**
 * Two fonts, per brand: a serif for the wordmark + display headlines, and a
 * warm humanist sans for everything else. Mulish stands in for the licensed
 * Gangjiem Regular until its font file is dropped into /public/fonts.
 */
const serif = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sonalibadani.com'),
  title: 'The One Partner Reset | Sonali Badani',
  description: `Your marriage isn't broken. You're simply repeating a pattern that's slowly pulling you apart. The One Partner Reset shows you the pattern, and how one shift on your side can begin to change the whole thing, even if he never changes. ₹${CHECKOUT_CONFIG.basePriceRupees}, 14-day money-back guarantee.`,
  openGraph: {
    type: 'website',
    title: 'The One Partner Reset | Sonali Badani',
    description: `Stop surviving your marriage. Start designing your Love Legacy. One shift on your side can begin to change the whole thing. ₹${CHECKOUT_CONFIG.basePriceRupees}.`,
    siteName: 'Sonali Badani · The Soul Space',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The One Partner Reset | Sonali Badani',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#203F5C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-body bg-cream text-navy antialiased">
        <SmoothScroll />
        <MetaPixel />

        {/* Google Analytics 4 (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TZDBVYV1RL"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-TZDBVYV1RL');`}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "x9tpa5d1pf");`}
        </Script>

        {children}

        {/* Razorpay checkout — lazy-loaded so it never blocks first paint. */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
