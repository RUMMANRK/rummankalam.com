import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rummankalam.com',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.includes('/links') })],
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },
});
