# ImageSage search strategy and maintenance

Research and implementation: 14 September 2026.

## Audience and page responsibilities

The site serves Windows users who want to find and organise images already on their PC. The primary conversion is a Microsoft Store visit or installation. These topic choices are based on product capabilities and observed search results, not measured keyword volumes or promised rankings.

| Page | Purpose |
| --- | --- |
| `index.html` | Explain offline AI photo search for Windows and offer the download. |
| `guides.html` | Help visitors choose the right workflow and prepare their library. |
| `search-photos-by-description.html` | Teach scene descriptions, query refinement and missing-result checks. |
| `search-text-in-screenshots.html` | Explain OCR, quoted phrases, file filters and recognition limitations. |
| `ai-photo-renamer.html` | Teach selecting, editing, reviewing and confirming proposed filenames. |
| Existing support and policy pages | Answer compatibility, preparation, privacy and AI-limit questions. |

Each guide has a distinct task, specific instructions, relevant internal links and a plain HTML Store link. Existing screenshots and the trailer remain authentic and unmodified. Image resizing/encoding uses Astro's existing build pipeline. The homepage's native `details` questions are accessible without JavaScript. The reveal animation never makes content initially invisible.

## Technical decisions

- Preserve the production origin `https://ringlochid.me` and base `/imagesage`. Preserve file-style `.html` URLs used by Microsoft Store.
- Retain `/imagesage/index.html` as the homepage canonical. `/imagesage/` serves the same page, while internal links and the sitemap consistently use the chosen canonical. Avoid an unnecessary URL migration.
- Generate `sitemap.xml` from static Astro pages. Do not fabricate `lastmod`, keyword tags, ratings, reviews or search-volume claims.
- The effective robots file is **`https://ringlochid.me/robots.txt`**, owned by `ringlochid/ringlochid.github.io`. A robots file inside `/imagesage/` would not control this host. Preserve other projects' sitemap entries when adding ImageSage's.
- Use unique page titles and descriptions, absolute canonicals and social URLs, descriptive alt text, responsive image candidates and explicit media dimensions.
- Reuse the existing 1280×720 JPEG trailer poster for Open Graph and Twitter previews. An identical source copy is compressed to WebP through Astro for the displayed poster, and that exact output URL is preloaded. The original JPEG and video are preserved.
- Mobile and reduced-motion visitors get a poster and native play controls without downloading the trailer on arrival. Desktop autoplay remains available. This reduces initial media work without removing the demonstration.
- Include accurate `WebPage`, guide `BreadcrumbList`, and homepage `SoftwareApplication` JSON-LD. The app information is semantic metadata, **not a claim of Google software rich-result eligibility**. Google's software rich result additionally requires a qualifying review or aggregate rating. Do not invent one to satisfy the validator.
- Keep the existing Microsoft Store direct-install badges, plus a normal visible Store link that works when the badge script fails.
- Retain the no-analytics website policy. Search Console and Bing Webmaster Tools measure search performance without adding visitor-tracking scripts to the website.

## Verification and deployment

Use the lockfile and the project's installed Astro version. This change was developed with Astro 7.2.2. The HTML checker uses the already-present parse5 7.3.0, now declared directly as a development dependency.

```sh
npm ci
npm run check
npm run build
npm run check:seo
```

The SEO checker reads the actual built HTML. It verifies unique metadata, canonical-to-file alignment, indexable directives, one primary heading, parseable structured data, breadcrumb positions, image dimensions and alt attributes, local assets, anchor targets, sitemap coverage and reachability from the homepage. It also protects the existing Store URLs and direct-install badge contract. The Pages build runs it before the deploy job can start.

After a scoped deployment of the ImageSage project and the root robots entry:

```sh
node scripts/check-seo.mjs --live
```

Also review the live homepage and guides at desktop and mobile widths, with JavaScript disabled and reduced motion enabled. Check the FAQ, guide navigation and Store fallback link. Lighthouse SEO and accessibility results cover automated checks only; performance lab results are not field Core Web Vitals or ranking forecasts.

The site deploys from `ringlochid/imagesage` main through GitHub Actions. Root `robots.txt` deploys independently from `ringlochid/ringlochid.github.io` main. Wait for each deployment and inspect the live files. To undo a release, revert its scoped commit and deploy normally; do not overwrite unrelated portfolio or LeoTabs files.

## Webmaster setup and measurement

Use the URL-prefix property `https://ringlochid.me/imagesage/` in both services. This limits the setup to ImageSage and does not require domain-wide DNS changes. The homepage contains the verification tags provided by the site owner's Google and Bing sessions; keep them after verification.

1. Verify ownership after the homepage deployment.
2. Submit `https://ringlochid.me/imagesage/sitemap.xml`.
3. Inspect the homepage and request indexing if available. Distinguish a successful submission from actual crawling, indexing and rankings.
4. Record a baseline for impressions, clicks, CTR, average position and landing pages. Separate brand queries from queries describing image-search tasks. New properties can take time to accumulate reports.
5. Compare successive 28-day windows. Use query/page evidence to refine titles and instructions; do not publish duplicate pages for minor keyword variations.
6. Compare search traffic trends with Microsoft Store acquisition reports where available. This site does not record outbound clicks, so do not report Store installs as directly attributed to SEO without supporting attribution data.

For further discovery, keep product links consistent on the author's portfolio and relevant existing listings. Share useful guides only where requested or permitted, and seek relevant editorial coverage. Purchased links, mass directory submissions and unsolicited community posting are not part of this implementation.

## Research basis

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide): crawlable links, useful text, understandable titles and site organisation.
- [Google: helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): distinct practical tasks, first-hand evidence and accurate limitations rather than mass-produced keyword pages.
- [Google: title links](https://developers.google.com/search/docs/appearance/title-link): descriptive titles that agree with the visible content.
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): consistency between canonicals, internal links and sitemaps.
- [Google: sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) and [robots.txt location](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt): discovery and host-root robots scope; submission does not guarantee indexing.
- [Google: image SEO](https://developers.google.com/search/docs/appearance/google-images): descriptive alternatives, surrounding content and image accessibility.
- [Google: software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app) and [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb): accurate properties and eligibility boundaries.
- [Google: Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start): ownership, sitemap reporting, URL inspection and measurement.
- [web.dev: optimise LCP](https://web.dev/articles/optimize-lcp): discover and prioritise the main visual without relying on late JavaScript.
- [Astro: static endpoints](https://docs.astro.build/en/guides/endpoints/) and [images](https://docs.astro.build/en/guides/images/): build-time sitemap and existing image optimisation.
- [GitHub: custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): build/deploy dependency and scoped release verification.

Bing's help pages require JavaScript in the research browser. Site verification and sitemap submission should therefore be checked against the actual signed-in Bing Webmaster Tools UI rather than inferred from an unread help page.
