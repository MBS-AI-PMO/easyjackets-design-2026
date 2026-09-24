# Easy Jackets — storefront frontend (Vite + React)

The 2026 redesign of easyjackets.com, converted from the Claude Design export
into a real single-page app.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run preview    # serve dist/ locally
npm run lint
```

## Layout

| Path | What it is |
|---|---|
| `src/pages/` | One component per page (29). Each keeps the design's data and handlers in a `renderVals()` function and its markup as JSX; a page-specific `.css` sits next to it when the design had page-only rules. |
| `src/components/` | `Nav` (desktop dropdowns + mobile drawer), `Footer`, `ImageSlot` (lazy image with caption fallback), `A` (one link component for routes, hashes and external URLs), `ScrollManager`. |
| `src/styles/tokens.css` | Design tokens, page-wide rules, motion/perf rules. |
| `src/styles/ui.css` | The shared `.ez-*` classes from the design. |
| `src/lib/` | `useDcState` (merging state setter the page logic was written against), `usePageProps` (design "props" as query params, e.g. `/cart?scenario=team`), `scroll`. |
| `design/` | The original export, kept as the source of truth for re-conversion. |
| `tools/convert-design.mjs` | Regenerates `src/pages/*` and `src/styles/ui.css` from `design/` (`npm run convert:design`). Four pages have small hand-conversions on top (see git history). |
| `tools/verify-against-export.mjs` | Renders the export and the app in headless Chrome and diffs text, checks console errors and phone-width overflow (`node tools/verify-against-export.mjs <exportDir> <appUrl> <outDir>`). |
| `tools/verify-app.mjs` | Behavioural checks against a running app: every internal link and hash target, overflow at 390/820/1366 px, and the interactive flows (drawer, shop filters, cart, checkout…). |
| `tools/check-image-urls.mjs` | Fetches every image URL the pages reference. |
| `tools/fetch-live-images.mjs` | Optional: downloads the client's own product photos and storefront shots into `public/images/`; then `EJ_LOCAL_IMAGES=1 npm run convert:design` swaps the design's third-party stock photos for them. Off by default. |

## Routes

`/` `/shop` `/product` `/design` `/how-to-design` `/bulk-orders` `/blog`
`/blog/:slug` `/faq` `/size-chart` `/material-colors` `/fabrics` `/gallery`
`/about` `/contact` `/reviews` `/shipping-returns` `/privacy-policy` `/terms`
`/track-order` `/cart` `/checkout` `/order-confirmation` `/account`
`/dashboard` `/united-states` `/united-states/:state` `/style-guide` and a 404.

## Known design-content notes

- Six links between Fabrics and Material Colors point at anchors the other page does not define (`#rib-knit`, `#lining`, `#sheep-leather`, `#cotton-twill`, `#nylon`, `#soft-shell`); they open the page at the top. Present in the export.
- The About team portraits and the Size Chart measurement diagram have no image in the design; the caption shows.
- Product and lifestyle photos are the design's own stock URLs (thejacketmaker.pk, clothoo.com), as are the "trusted by" marquee logos.

## Deploy

`Dockerfile` builds the app and serves `dist/` with nginx (`nginx.conf`, SPA
fallback to `index.html`). Coolify: Dockerfile build pack, port 80.
