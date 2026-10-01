# Easy Jackets 2026

The storefront redesign and its API, side by side. The current live site and
its backend are separate and untouched by this repo.

| Folder | What | Local |
|---|---|---|
| `frontend/` | Vite + React storefront (converted from the Claude Design export) | `cd frontend && npm install && npm run dev` → http://localhost:5173 |
| `backend/` | Express + Mongoose API ("Node Backend 2026", a copy of the current backend pointed at its own database) | `cd backend && npm install && npm run dev` → http://localhost:8080 |
| `admin/` | Admin panel (CRA) on the new backend and storefront | `cd admin && npm install && npm start` → http://localhost:3000 |
| `custom-jacket/` | The jacket builder / design lab (CRA), copied from the live `custom-jacket` and wired to this backend and storefront | `cd custom-jacket && npm install && npm start` → http://localhost:3001 |

Each folder has its own Dockerfile (its build arguments and defaults are listed
there). No env file of any kind is kept in the repo: settings and secrets are
entered in Coolify, and each developer keeps their own local `.env`. Coolify
deploys each folder as an app from this repo: Base Directory `/frontend` (port 80), `/backend` (port
8080), `/admin` (port 80) and `/custom-jacket` (port 80, domain
`custom.145.223.75.247.sslip.io`, the builder address the storefront, admin and
backend use by default).

The builder hands off to the storefront: **Add to cart** sends the saved cart
ids to `/cart?index=…` (the cart adds each design once), **Review** opens
`/design/<id>` (every view and the full spec), and a cart line's **Edit design**
reopens the builder with `?designedit=<id>`. Its API and storefront addresses
are in `custom-jacket/src/config/url.js` (localhost → the local apps; never the
live site).

## Backend additions in this repo (not in the current live backend)

- `GET /api/v1/product/product-filters` gained `sort` (new · popular · price-asc · price-desc · rating), `minPrice`/`maxPrice`, `view=card` (no long-text fields) and per-product `rating`/`reviewCount`; the effective price applies `discountPrice` as a percentage, as the storefront does.
- `GET /api/v1/product/category-counts` — products per category.
- `GET /api/v1/product/filter-options?category=<slug>` — the materials and colours the products are actually made in (with counts), for the shop’s filters.
- `GET /api/v1/product/cutouts` — upload keys of product photos whose background has been removed, read from the file store (a cut-out keeps `<name>.original.<ext>` beside it); the storefront drops the white box around those. No database field.
- `GET /api/v1/product/landing` — the landing page in one query: two random bestsellers per jacket category plus one random jacket per "popular pick" (wool & leather, all-leather, all-wool, satin). Category list cached for a minute.
- `/uploads/<key>` mirrors the live site: a file missing locally is fetched once from `LEGACY_UPLOADS_URL` (`helpers/uploadMirror.js`) and kept, so the existing resizer serves `?w=320…1280` copies from this host. `node scripts/warmImageCache.mjs` pre-fills the mirror and the resized copies against a running backend.
- `/api/v1/patches` — Embroidery & Patches photos, a sibling of `/gallery` with a `tags` field (Patches · Chenille · Embroidery · Rhinestone · Printed · Names & numbers); the admin app's new "Embroidery & Patches" screen (`admin/src/Components/patchPhotos.js`, reusing the gallery screen with an endpoint and tag picker) uploads to it. `pageFaq.category` (optional) groups the FAQ page; the admin's Storefront FAQs screen has the field.
- `GET /api/v1/order/track?orderId=&email=` — guest order tracking for the storefront (customer-safe fields only). `create-checkout-session` / `create-guest-checkout-session` also return the Stripe session `url` (the live copy returns only `id`).
- Deploy note: the backend's `CLIENT_URL` must be the new storefront's URL — Stripe sends buyers back to `{CLIENT_URL}/success/{CHECKOUT_SESSION_ID}` and `/cancel`, both routes of this frontend.
- Background removal for product photos is part of the backend, not a separate app: `backend/bg-remover/` is a small Python service (FastAPI + rembg; BiRefNet-general, with isnet as the fast fallback) that the backend's Docker image installs with both models, and that the API starts itself on 127.0.0.1:7860 and restarts if it stops (`helpers/bgRemoverProcess.js`). The image is therefore ~2 GB larger and its first build takes a while. Memory: ~1.6 GB with the model loaded, ~7 GB at the peak of one BiRefNet photo (`BG_REMOVER_MODEL=isnet-general-use` needs ~1.2 GB and ~2 s per photo, for a small server). The admin product form has a **Remove background** switch (on by default, remembered per browser) with the remover's state under it; it is sent as `removeBackground` and only photos uploaded with it on are processed. Env: `AUTO_REMOVE_BG=false` pauses it, `BG_REMOVER_EMBEDDED=false` never starts it, `BG_REMOVER_URL` (+ `BG_REMOVER_KEY`) uses an outside service instead. The backend (`helpers/backgroundRemoval.js`) queues each new product photo after upload, replaces the stored file in place at the same pixel size (the original stays beside it as `*.original.*`, resized copies are purged) and never blocks the admin. `node scripts/removeProductBackgrounds.mjs [--apply | --out DIR] [--save DIR] [--keys …] [--category slug] [--limit N]` runs it over existing photos (dry run by default; `--save` keeps each original and its transparent PNG under DIR/<category>/<product>/). Masters are stored as **lossless** webp so the only lossy step is the resizer (quality 85, smart chroma subsampling); `node scripts/rebuildCutoutMasters.mjs --from DIR` re-encodes existing masters losslessly from those PNG copies. Tested on 43 photos: edges clean, white snaps on white sleeves kept, pixels inside the garment unchanged (mean difference ≈1/255 from WebP re-encoding); ≈30 s per photo on a laptop CPU with BiRefNet.
- Admin app: `admin/` is the admin panel (a copy of `admin-easyjacket`, plus the FAQ category field and the Embroidery & Patches screen) — Coolify Base Directory `/admin`, port 80, build args `REACT_APP_API_URL`, `REACT_APP_FRONTEND_URL`, `REACT_APP_CUSTOM_URL` (see `admin/.env.example`). The live admin folder is untouched.
- Photo tooling: `node scripts/enhancePhotos.mjs <manifest> <dir>` turns phone photos into web-ready WebP (levels, colour, Lanczos upscale to 1600 px, sharpen); `node scripts/uploadToLiveStorage.mjs <manifest> <dir>` stores them on the live site's upload storage through its admin image upload (a file store only — nothing on the live site displays them) and writes the URLs into the manifest, e.g. `frontend/src/data/embroidery-photos.json` for the Embroidery & Patches page.
- `GET /api/v1/reviews/featured?limit=` — best approved reviews plus overall `total`/`averageRating`.
- `config/db.js` honours `DNS_SERVERS` for machines whose resolver refuses the Atlas SRV lookup.
