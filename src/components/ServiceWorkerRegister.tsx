'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Delay registration slightly until after initial page load to preserve FCP/LCP
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[VECTR-SW] Registered successfully with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[VECTR-SW] Registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
