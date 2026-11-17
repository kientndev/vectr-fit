import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

// Fallback direct release download if env variable is not configured
const DEFAULT_RELEASE_URL =
  'https://github.com/kientndev/vectr-fit/releases/latest/download/vectr-fit-v1.0.0.apk';

/**
 * Clean Edge Redirect Route: /api/download
 * Redirects immediately to the zero-cost GitHub Release binary.
 * Compatible with Next.js static HTML export (Capacitor APK) and Vercel edge/serverless deployments.
 */
export async function GET() {
  const downloadUrl =
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || DEFAULT_RELEASE_URL;

  return NextResponse.redirect(downloadUrl, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'X-Vectr-Binary-Source': 'GitHub-Releases',
    },
  });
}
