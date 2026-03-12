import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: false, // using public/manifest.json directly
      workbox: {
        // precache app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          // leads api: network first with offline fallback
          {
            urlPattern: /\/api\/leads/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'leads-api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // lms content: stale while revalidate for offline reading
          {
            urlPattern: /\/api\/lms\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lms-content-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // dashboard stats: network first with short cache
          {
            urlPattern: /\/api\/dashboard/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dashboard-cache',
              expiration: { maxAgeSeconds: 300 },
              networkTimeoutSeconds: 3,
            },
          },
          // static images: cache first
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
            },
          },
          // lms materials (pdfs, videos): cache first for offline
          {
            urlPattern: /\/storage\/lms-materials\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lms-materials-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 2592000 },
              rangeRequests: true,
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
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          axios:  ['axios'],
        }
      }
    }
  }
}))