// src/app/(public)/page.tsx
import LandingPage from '@/components/pages/LandingPage';

export const metadata = {
  title: 'EVLink – Smarter EV integration for Home Assistant',
  description:
    'EVLink connects your electric vehicle to Home Assistant using Enode. Open-source, secure, and easy to use.',
  keywords: [
    'EVLink',
    'electric vehicle',
    'Home Assistant',
    'EV integration',
    'Enode',
    'smart charging',
    'open source',
  ],
  openGraph: {
    title: 'EVLink – Smarter EV integration for Home Assistant',
    description:
      'EVLink connects your EV to Home Assistant using Enode. Secure and open-source.',
    url: 'https://evlink.se/',
    siteName: 'EVLink',
    images: [
      {
        url: 'https://evlink.se/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPageRoute() {
  return <LandingPage />;
}
