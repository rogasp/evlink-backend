// src/app/(public)/page.tsx
import LandingPage from '@/components/pages/LandingPage';

export const metadata = {
  // Hardcoded string
  title: 'EVLinkHA – Smarter EV integration for Home Assistant',
  // Hardcoded string
  description:
    'EVLinkHA connects your electric vehicle to Home Assistant using Enode. Open-source, secure, and easy to use.',
  // Hardcoded string array
  keywords: [
    'EVLinkHA',
    'electric vehicle',
    'Home Assistant',
    'EV integration',
    'Enode',
    'smart charging',
    'open source',
  ],
  openGraph: {
    // Hardcoded string
    title: 'EVLinkHA – Smarter EV integration for Home Assistant',
    // Hardcoded string
    description:
      'EVLinkHA connects your EV to Home Assistant using Enode. Secure and open-source.',
    url: 'https://evlinkha.se/', // URL, consider if dynamic
    // Hardcoded string
    siteName: 'EVLinkHA',
    images: [
      {
        url: 'https://evlinkha.se/og-image.png', // URL, consider if dynamic
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US', // Locale, should be dynamic for i18n
    type: 'website', // Hardcoded string
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPageRoute() {
  return <LandingPage />;
}
