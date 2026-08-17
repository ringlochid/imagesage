// @ts-check
import { defineConfig } from 'astro/config';

// The site is a GitHub Pages *project* site: the custom domain ringlochid.me is
// attached to the user site, and this repo is served from /imagesage/.
//
// build.format: 'file' is load-bearing. Astro's default ('directory') would emit
// privacy/index.html and change the public URL to /imagesage/privacy/. The
// existing .html URLs are declared to Microsoft Partner Center as the privacy
// and support destinations, so they must not move.
export default defineConfig({
  site: 'https://ringlochid.me',
  base: '/imagesage',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  compressHTML: true,
});
