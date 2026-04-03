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
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: false, // using public/manifest.json directly
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        // The devOptions might be needed if testing in dev mode
      },
      devOptions: {
        enabled: true,
        type: 'module',
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