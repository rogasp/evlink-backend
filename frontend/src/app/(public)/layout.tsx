'use client';

import { Toaster } from 'sonner';
import { RegistrationProvider } from '@/contexts/RegistrationContext';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';
import NewsletterModal from '@/components/NewsletterModal';
import NavbarPublic from '@/components/layout/NavbarPubic';
import I18nProvider from '@/components/I18nProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Umami script injected for public layout */}
      <Script
        src="https://umami.theswed.dev/script.js"
        data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        strategy="afterInteractive"
      />
      <Toaster position="top-center" richColors closeButton={false} />
      <I18nProvider>
        <RegistrationProvider>
          <SupabaseProvider>
            <NavbarPublic />
            {children}
            <Footer />
            <NewsletterModal />
          </SupabaseProvider>
        </RegistrationProvider>
      </I18nProvider>
    </>
  );
}
