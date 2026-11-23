import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds and get precached cleanly by VitePWA.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        writeBundle(): void {
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [],
        manifest: {
          id: '/',
          name: 'كتاب الجغرافيا التفاعلي – الصف التاسع (طبعة 2026)',
          short_name: 'الجغرافيا 9',
          description:
            'تطبيق ويب تعليمي تفاعلي يعمل بدون إنترنت لكتاب جغرافية الجمهورية اليمنية والوطن العربي للصف التاسع الأساسي.',
          dir: 'rtl',
          lang: 'ar',
          theme_color: '#0284c7',
          background_color: '#f8fafc',
          display: 'standalone',
          display_override: ['standalone', 'minimal-ui'],
          orientation: 'any',
          start_url: '/',
          scope: '/',
          prefer_related_applications: false,
          categories: ['education', 'books'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'الوحدات والدروس',
              short_name: 'الدروس',
              description: 'فتح مدخل الوحدات الـ 4 والدروس الـ 18',
              url: '/?portal=units',
              icons: [{src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png'}],
            },
            {
              name: 'الأطلس التفاعلي',
              short_name: 'الأطلس',
              description: 'استكشاف الخرائط ثنائية وثلاثية الأبعاد',
              url: '/?portal=atlas',
              icons: [{src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png'}],
            },
            {
              name: 'الملزمة الشاملة',
              short_name: 'الملزمة',
              description: 'المقارنات الوزارية والملخصات القابلة للطباعة',
              url: '/?portal=study-guide',
              icons: [{src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png'}],
            },
            {
              name: 'التدريب والتقويم',
              short_name: 'التدريبات',
              description: 'الأسئلة الوزارية وبنك التدريبات التفاعلي',
              url: '/?portal=training',
              icons: [{src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png'}],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2,json}'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: /\/src\/assets\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'local-textbook-images',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
