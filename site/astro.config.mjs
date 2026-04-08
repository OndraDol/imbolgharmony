// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ondradol.github.io',
  base: '/imbolgharmony',
  integrations: [sitemap()],
  image: {
    domains: [],
  },
});
