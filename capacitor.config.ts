import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vectrfit.app',
  appName: 'VECTR FIT',
  webDir: 'out',
  backgroundColor: '#09090B',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#09090B',
    allowMixedContent: true,
  },
};

export default config;

