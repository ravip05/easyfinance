import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: false, // using public/manifest.json directly
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        // offline shell fallback for spa navigation
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // lead data uses network first with offline fallback to dexie
            urlPattern: /\/api\/leads/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'leads-api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // lms content is relatively static so stale while revalidate works well
            urlPattern: /\/api\/lms\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lms-content-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // dashboard data needs freshness but should fall back to cache
            urlPattern: /\/api\/dashboard/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dashboard-cache',
              expiration: { maxAgeSeconds: 300 },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // support tickets need real time accuracy
            urlPattern: /\/api\/tickets/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tickets-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 3600 },
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // staff and franchise dashboards use stale while revalidate for snappy loading
            urlPattern: /\/api\/(staff|franchise|client)\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'role-dashboard-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 1800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
            },
          },
          {
            // lms training materials cached for offline study
            urlPattern: /\/storage\/lms-materials\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lms-materials-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 2592000 },
              rangeRequests: true,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets-v1.3',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts-v1.3',
              expiration: { maxEntries: 20, maxAgeSeconds: 31536000 },
            },
          },
        ],
      },
    }),
  ],
  server: command === 'serve' ? {
    port: 3000,
    proxy: { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } }
  } : {},
  resolve: {
    alias: {
      '@capacitor/app': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capacitor/camera': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capacitor/core': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capacitor/filesystem': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capacitor/geolocation': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capacitor/network': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capacitor/preferences': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capacitor/push-notifications': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capacitor/share': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '@capgo/capacitor-native-biometric': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
      '/@capacitor/app': path.resolve(__dirname, './src/stubs/capacitor-stub.js'),
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          axios:  ['axios'],
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
}))