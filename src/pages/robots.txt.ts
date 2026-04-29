import type { APIRoute } from 'astro';
import config from '@/data/site.config';

export const GET: APIRoute = () => {
  const body = config.isIndexable === false
    ? `User-agent: *\nDisallow: /`
    : `User-agent: *\nAllow: /\n\nSitemap: ${config.domain}/sitemap-index.xml`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
