# ImageSage public site

Landing page plus the privacy, support, AI-transparency and licensing pages for ImageSage.

Published through GitHub Pages at <https://ringlochid.me/imagesage/>. The site contains no
application source code, developer analytics, forms, accounts, or backend service. The landing page
loads Microsoft's official Store badge from `get.microsoft.com` for the direct-install flow.

## Stack

[Astro](https://astro.build) 7 with static output. A small client-side bundle uses
[Motion](https://motion.dev/) for one-time scroll reveals and respects reduced-motion preferences.
Microsoft's hosted Store web component supplies the two download badges and falls back to ordinary
Store links when JavaScript is unavailable.

## Local development

Requires Node.js 22.12 or later.

```bash
npm install
```

```bash
npm run dev
```

The dev server runs at <http://localhost:4321/imagesage> — note the `/imagesage` path, which matches
the base the site is served under in production.

> **If `npm run dev` reports `'astro' is not recognized`**, the machine's `PATH` has grown past the
> ~8,191 characters `cmd.exe` can receive, so npm's script shell starts with an empty `PATH`. Either
> prune `PATH`, or bypass the script shell entirely:
>
> ```powershell
> node node_modules/astro/bin/astro.mjs dev
> ```

| Script | Does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | Type-check `.astro` files |

## Publishing

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes
`dist/` to Pages. Pages must be set to **Build and deployment → Source: GitHub Actions**.

### Page URLs are load-bearing

`astro.config.mjs` sets `build.format: 'file'` so pages build to `privacy.html` rather than
`privacy/index.html`. The `.html` URLs are declared to Microsoft Partner Center as the privacy and
support destinations for the Store listing, and must not move.

## Copyright

Website content and ImageSage branding are proprietary. See [LICENSE.md](LICENSE.md).
