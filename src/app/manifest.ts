import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VECTR FIT — AI Form & Pose Coach',
    short_name: 'VECTR FIT',
    description: 'AI-powered daily athletic coaching OS. Real-time 33-joint skeletal pose tracking and offline biomechanics laboratory in your browser.',
    start_url: '/app',
    id: '/app',
    scope: '/',
    display: 'standalone',
    background_color: '#07090E',
    theme_color: '#07090E',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
