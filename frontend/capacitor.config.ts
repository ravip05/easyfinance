import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'in.easyfinancewale.crm',
  appName: 'EasyFinance CRM',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // for dev: proxy api calls to the laravel backend
    // comment this out for production builds
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      // no special config needed
    },
  },
  android: {
    allowMixedContent: false,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  ios: {
    scheme: 'EasyFinanceCRM',
    contentInset: 'always',
  },
}

export default config
