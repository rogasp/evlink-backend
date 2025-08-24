// src/app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          id="brevo-sdk-loader"
          src="https://cdn.brevo.com/js/sdk-loader.js"
          strategy="afterInteractive"
        />
        <Script id="brevo-init" strategy="afterInteractive">
          {`
            window.Brevo = window.Brevo || [];
            Brevo.push([
              "init",
              {
                client_key: "${process.env.NEXT_PUBLIC_BREVO_CLIENT_KEY}"
                // … andra init-options om du vill …
              }
            ]);
          `}
        </Script>
        <script
          defer
          src="https://umami.theswed.dev/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        />
      </head>
      <body className={`antialiased ${geistSans.variable} ${geistMono.variable}`}>
        {children}
        </body>
    </html>
  );
}
