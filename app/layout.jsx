import './globals.css';

export const metadata = {
  title: 'LokaBite — Food & Grocery Delivery',
  description: 'Hyperlocal delivery for rural India.',
  manifest: '/manifest.json',
  appleWebAppCapable: 'yes',
  appleWebAppStatusBarStyle: 'default',
  appleWebTitle: 'LokaBite',
};

export const viewport = {
  themeColor: '#FF6B35',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

import { LanguageProvider } from '@/components/LanguageProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <LanguageProvider>
          <div className="mobile-frame bg-gray-50 min-h-screen flex flex-col">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
