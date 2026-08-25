// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import d2 from 'astro-d2';

export default defineConfig({
  site: 'http://localhost:5000',
  server: { host: true },
  integrations: [
    d2({ experimental: { useD2js: true } }),
    starlight({
      title: 'Video Bibliographer',
      description: 'Trace the historical references hiding in spoken video.',
      routeMiddleware: './src/routeData.ts',
      customCss: ['./src/styles/global.css'],
      sidebar: [
        { label: 'Start here', items: [{ label: 'Home', slug: '' }, { label: 'Methodology', slug: 'guides/methodology' }] },
        { label: 'Browse', items: [{ label: 'Sample work product', slug: 'bibliographies/sample' }] },
        { label: 'Reference', items: [{ label: 'Configuration', slug: 'reference/configuration' }] },
      ],
    }),
  ],
});

/** @typedef {import('astro').AstroConfig} AstroConfig */
