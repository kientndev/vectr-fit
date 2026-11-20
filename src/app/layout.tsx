import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ConvexClientProvider } from '../components/ConvexClientProvider';
import { ServiceWorkerRegister } from '../components/ServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: '#07090E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'VECTR // FIT — AI Form & Pose Coach v1.0',
  description: 'AI-powered daily athletic coaching OS. Real-time 33-joint skeletal pose tracking and offline biomechanics laboratory in your browser.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VECTR FIT',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#07090E] text-zinc-100">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-[#07090E] text-zinc-100 antialiased selection:bg-[#A3E635] selection:text-black">
        <ConvexClientProvider>
          <ServiceWorkerRegister />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
