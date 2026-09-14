/** Single source of truth for values that appear on more than one page. */

/** BASE_URL is "/imagesage" here; strip any trailing slash so callers can
 *  always write `${base}/thing` without doubling up. */
export const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Root-absolute URL for an in-site path. Used instead of relative hrefs so
 *  links behave identically in `astro dev` and on Pages under /imagesage/. */
export const url = (path: string) => `${base}/${path.replace(/^\/+/, '')}`;

export const STORE_URL = 'https://apps.microsoft.com/store/detail/9MT89HD9S6SM';
export const SUPPORT_EMAIL = 'support@ringlochid.me';

export const GUIDES = [
  {
    href: 'search-photos-by-description.html',
    label: 'Search photos by description',
    description: 'Find a photo by its subject or scene, even when you cannot remember the filename.',
  },
  {
    href: 'search-text-in-screenshots.html',
    label: 'Search text inside screenshots',
    description: 'Use local OCR to find screenshots, receipts and other images by the words they contain.',
  },
  {
    href: 'ai-photo-renamer.html',
    label: 'Rename photos with local AI',
    description: 'Turn selected photos into editable filename suggestions, then review before applying.',
  },
];

export const NAV = [
  { href: 'guides.html', label: 'Guides' },
  { href: 'support.html', label: 'Support' },
  { href: 'privacy.html', label: 'Privacy' },
];
