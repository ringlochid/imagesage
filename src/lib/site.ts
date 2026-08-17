/** Single source of truth for values that appear on more than one page. */

/** BASE_URL is "/imagesage" here; strip any trailing slash so callers can
 *  always write `${base}/thing` without doubling up. */
export const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Root-absolute URL for an in-site path. Used instead of relative hrefs so
 *  links behave identically in `astro dev` and on Pages under /imagesage/. */
export const url = (path: string) => `${base}/${path.replace(/^\/+/, '')}`;

export const STORE_URL = 'https://apps.microsoft.com/store/detail/9MT89HD9S6SM';
export const SUPPORT_EMAIL = 'support@ringlochid.me';

export const NAV = [
  { href: 'privacy.html', label: 'Privacy' },
  { href: 'ai-transparency.html', label: 'AI transparency' },
  { href: 'support.html', label: 'Support' },
  { href: 'license.html', label: 'Licence' },
];
