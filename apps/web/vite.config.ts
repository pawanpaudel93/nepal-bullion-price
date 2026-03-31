import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Nepal Bullion Price',
        short_name: 'Bullion',
        description: 'Nepal gold and silver prices — FENEGOSIDA daily rates + live international prices',
        start_url: '/',
        display: 'standalone',
        background_color: '#1C1917',
        theme_color: '#CA8A04',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/prices/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-prices',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /\/api\/news/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-news',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 15,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
