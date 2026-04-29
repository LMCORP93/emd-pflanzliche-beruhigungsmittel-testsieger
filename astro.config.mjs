import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

const siteConfigSource = readFileSync(new URL('./src/data/site.config.ts', import.meta.url), 'utf8');
const domainMatch = siteConfigSource.match(/domain:\s*['"]([^'"]+)['"]/);
const site = domainMatch?.[1] ?? 'https://example.com';

export default defineConfig({
  output: 'static',
  integrations: [tailwind(), sitemap()],
  site,
  build: {
    inlineStylesheets: 'auto',
  },
});
