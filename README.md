# astro-wp-headless

A static **Astro** front end that consumes the **WordPress REST API** at build time, with **React islands** for the parts that need client-side JavaScript.

This is the pattern behind "headless WordPress": editors keep using the WordPress admin they already know, while the public site is pre-rendered HTML with no PHP and no database on the request path.

**Live demo:** https://astro-wp-headless.netlify.app

## What it demonstrates

- **Build-time data fetching** from `wp/v2/posts` (no runtime API calls, no keys in the browser)
- **Typed API layer** (`src/lib/wp.ts`): response types, entity decoding, tag stripping, excerpt truncation, reading-time estimate
- **Dynamic routes** via `getStaticPaths` — one static page per WordPress post
- **React islands** (`client:load`) for the search filter; everything else ships zero JS
- **Accessible markup**: skip link, landmarks, `aria-live` search status, `focus-visible`, `prefers-reduced-motion`
- **Resilient builds**: if the WordPress API is unreachable the page renders an error state instead of crashing
- **Netlify config** with security headers

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 7 (static output) |
| UI islands | React 19 |
| Language | TypeScript |
| Content | WordPress REST API (`wp/v2`) |
| Hosting | Netlify |

## Getting started

```bash
npm install
cp .env.example .env      # point WP_API_URL at any WordPress install
npm run dev               # http://localhost:4321
npm run build             # static output in dist/
npm run preview
```

### Pointing it at a different WordPress site

Set `WP_API_URL` to any site's REST base (the part before `/wp/v2/`):

```bash
WP_API_URL=https://example.com/wp-json
```

If the site disables the REST API or blocks unauthenticated requests, the build falls back to an error state.

## Structure

```
src/
├── components/     Header, Footer, PostCard, SearchPosts (React island)
├── layouts/        Base layout: meta, canonical, OG tags, skip link
├── lib/wp.ts       WordPress API client + types + text utilities
├── pages/
│   ├── index.astro
│   ├── blog/index.astro        list + React search filter
│   └── blog/[slug].astro       one static page per post
└── styles/global.css
```

## Notes

- Demo content is pulled from `wordpress.org/news` so the repo builds without credentials. Replace `WP_API_URL` with your own site.
- `_fields` is used on every request to avoid shipping unused payload from WordPress.
- Post HTML is rendered with `set:html` because WordPress already sanitizes content server-side; for user-submitted content you would add a sanitizer.

## License

MIT — code only. Content belongs to its respective WordPress site.
