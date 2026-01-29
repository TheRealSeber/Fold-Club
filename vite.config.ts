import devtoolsJson from 'vite-plugin-devtools-json';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['localStorage', 'url', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        // Root path - MUST be before catch-all to prevent /en/en/en
        {
          pattern: '/',
          localized: [
            ['pl', '/'],
            ['en', '/en']
          ]
        },
        // Landing pages - translated paths
        {
          pattern: '/shop/puzzle-3d',
          localized: [
            ['pl', '/sklep/puzzle-3d'],
            ['en', '/en/shop/puzzle-3d']
          ]
        },
        {
          pattern: '/shop/assembly-models',
          localized: [
            ['pl', '/sklep/modele-do-sklejania'],
            ['en', '/en/shop/assembly-models']
          ]
        },
        {
          pattern: '/shop/papercraft',
          localized: [
            ['pl', '/sklep/papercraft'],
            ['en', '/en/shop/papercraft']
          ]
        },
        // Product pages
        {
          pattern: '/products/:slug',
          localized: [
            ['pl', '/produkty/:slug'],
            ['en', '/en/products/:slug']
          ]
        },
        // Main shop page
        {
          pattern: '/shop',
          localized: [
            ['pl', '/sklep'],
            ['en', '/en/shop']
          ]
        },
        // Other pages
        {
          pattern: '/gallery',
          localized: [
            ['pl', '/galeria'],
            ['en', '/en/gallery']
          ]
        },
        {
          pattern: '/cart',
          localized: [
            ['pl', '/koszyk'],
            ['en', '/en/cart']
          ]
        },
        {
          pattern: '/checkout',
          localized: [
            ['pl', '/kasa'],
            ['en', '/en/checkout']
          ]
        },
        {
          pattern: '/contact',
          localized: [
            ['pl', '/kontakt'],
            ['en', '/en/contact']
          ]
        },
        // Catch-all for remaining routes - English paths stay, Polish gets no prefix
        {
          pattern: '/:path(.*)?',
          localized: [
            ['pl', '/:path(.*)?'],
            ['en', '/en/:path(.*)?']
          ]
        }
      ]
    }),
    devtoolsJson()
  ]
});
