import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'OberstufenCheck NRW',
        short_name: 'OberstufenCheck',
        description: 'Oberstufenplanung NRW – APO-GOSt Regelprüfung',
        theme_color: '#6c2bd9',
        background_color: '#faf9fe',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'de',
        start_url: '.',
        scope: '.',
        categories: ['education'],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
