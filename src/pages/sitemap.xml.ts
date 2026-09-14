import type { APIRoute } from 'astro';
import { url } from '../lib/site';

// Derive URLs from the static pages, preserving the site's public .html contract.
// Do not fabricate lastmod dates from build time.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('The production site URL is required for the sitemap.');
  const pages = Object.keys(import.meta.glob('./**/*.astro'))
    .map((path) => path.replace(/^\.\//, '').replace(/\.astro$/, '.html'))
    .sort();
  const entries = pages.map((page) =>
    `<url><loc>${new URL(url(page), site).href}</loc></url>`
  ).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
