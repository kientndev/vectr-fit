import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ConvexClientProvider } from '../components/ConvexClientProvider';

export const viewport: Viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'VECTR // FIT — Daily AI Coaching OS v1.0',
  description: 'AI-powered daily athletic coaching SaaS. Deterministic daily blueprints for Calisthenics Mastery and Gym Iron.',
  manifest: '/manifest.webmanifest',
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
    <html lang="en" className="dark h-full bg-[#09090B] text-zinc-100">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-[#09090B] text-zinc-100 antialiased selection:bg-[#A3E635] selection:text-black">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
