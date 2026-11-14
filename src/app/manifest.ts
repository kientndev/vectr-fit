import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VECTR FIT — Daily AI Coaching OS',
    short_name: 'VECTR FIT',
    description: 'AI-powered daily athletic coaching SaaS. Deterministic daily blueprints for Calisthenics Mastery and Gym Iron.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090B',
    theme_color: '#09090B',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
