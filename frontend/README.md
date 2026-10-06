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
| `src/pages/` | One component per page (29), converted once from the Claude Design export (the converter is in git history). Each keeps its data and handlers in a `renderVals()` function and its markup as JSX; a page-specific `.css` sits next to it when the page has its own rules. These are the source of truth and are edited by hand. |
| `src/components/` | `Nav` (desktop dropdowns + mobile drawer), `Footer`, `ImageSlot` (lazy image with caption fallback), `A` (one link component for routes, hashes and external URLs), `ScrollManager`. |
| `src/styles/tokens.css` | Design tokens, page-wide rules, motion/perf rules. |
| `src/styles/ui.css` | The shared `.ez-*` classes from the design. |
| `src/lib/` | `useDcState` (merging state setter the page logic was written against), `usePageProps` (design "props" as query params, e.g. `/cart?scenario=team`), `scroll`. |
| `tools/verify-against-export.mjs` | Renders the original export (pass its folder) and the app in headless Chrome and diffs text, console and phone-width overflow. |
| `tools/verify-app.mjs` | Behavioural checks against a running app: every internal link and hash target, overflow at 390/820/1366 px, and the interactive flows (drawer, shop filters, cart, checkout…). |
| `tools/check-image-urls.mjs` | Fetches every image URL the pages reference. |
| `tools/fetch-live-images.mjs` | Optional: downloads the client's own product photos and storefront shots into `public/images/`; then `EJ_LOCAL_IMAGES=1 npm run convert:design` swaps the design's third-party stock photos for them. Off by default. |

## Routes

The storefront uses the **live site's URL scheme**, so it can replace easyjackets.com
without breaking an indexed address. Build links with `src/lib/urls.js`
(`shopPath`, `productPath`, `blogPath`), never by hand.

| Page | Canonical path |
|---|---|
| Landing, shop | `/`, `/shop` |
| Collections | `/shop/category/<slug>`, `/shop/material/<slug>`, `/shop/color/<slug>`, `/shop/size/<slug>`; several filters: `/shop/filter/category/<a>/material/<b>` (view options stay in the query: `?sort` `?max` `?q` `?page`) |
| Product, blog | `/product/<lower-case slug>`, `/new-blog`, `/new-blog/<slug>` |
| Content | `/design-custom-jacket` `/how-to-design-jacket` `/bulk-order` `/faq` `/sizechart` `/material-colors` `/fabrics` `/gallery` `/embroidery-and-patches` `/about-us` `/contact-us` `/reviews` `/shipping` `/privacypolicy` `/terms-and-conditions` `/united-states` `/united-states/:state` |
| Account and checkout (noindex) | `/cart` `/checkout` `/account` `/dashboard` `/order-confirmation` `/success/:sessionId` `/track-order` |

Every other spelling redirects to one of these: the first 2026 paths (`/bulk-orders`,
`/blog/:slug`, `/size-chart`, `/about`, `/contact`, `/design`, `/shipping-returns`,
`/privacy-policy`, `/terms`, `/shop?category=…`), the live site's aliases (`/guide`,
`/photo-gallery`, `/return-policy`, `/login`, `/sign-up`, `/user/*`, `/products/:slug`,
`/order-confirmation/:id`, `/design/:id` → the jacket builder) and any upper-case variant
(`/Shop`, `/BulkOrder`, an upper-case product slug). `components/Seo.jsx` writes the
`<link rel="canonical">` and `og:url` for every page (query dropped, except a shop page
number above 1) and `noindex` for the account and checkout pages; the admin's SEO screen
(`/metadata/by-path`) matches these paths directly.

Not carried over yet from the live site: its keyword landing pages (`/letterman-jackets`,
`/school-jackets`, `/senior-jackets`, `/team-jackets`, `/mens-varsity-jackets`,
`/womens-varsity-jackets`, `/leather-varsity-jackets`, `/wool-and-leather-varsity-jackets`,
`/satin-bomber-jackets`), the `/sports-spirit-wears` catalogue, and the `/sitemap.xml`
proxy its server provides — these 404 on this app until they are added.

## Data sources (pages wired to the API so far)

| Page | Source |
|---|---|
| Nav menus | `/category/get-category?section=jackets`, `/property/materials` |
| `/` landing | top bar `/features/top-bar` · picks + bestsellers `/product/landing` (one call, random on every visit) · category tiles `/category` + `/product/category-counts` · materials tiles `/fabric-colors` (first swatch per section) · patches tiles + "Made for real teams" `/gallery` (captions decide which photo illustrates which tile; add photos in the admin and they appear) · blog `/features/blogs/recent` · FAQ `/features/page-faqs` key `/` · reviews `/reviews/featured` (hidden until reviews are approved) · hero/builder photos are the client's own in `public/images/site` |
| Images | every upload URL goes through this API (`uploadUrl`), which mirrors the live uploads and resizes on demand; `ImageSlot width={…}` requests `?w=` at the display size (2x for sharp screens) and fades the picture in when it has loaded. Product photos whose background has been removed (`/product/cutouts`, read from the file store; `src/lib/cutouts.js` refreshes the list every minute) get `data-cutout="true"` on the image, and the `.ez-product-photo` box around them turns transparent so the cut-out sits on the page colour while unprocessed photos keep their white box |
| `/embroidery-and-patches` | `/patches` (admin's Embroidery & Patches screen, tags = chips) + the launch photos in `src/data/embroidery-photos.json` + `/gallery` photos tagged by caption (patches · chenille · embroidery · names & numbers) plus the client's own detail shots in `public/images/site`; same layout as the Photo Gallery |
| `/shop` | `/product/product-filters` (category, material, colour, sort, price, search, pagination) · tabs `/product/category-counts` · material chips and colour swatches `/product/filter-options?category=` (only what the products in the open category are made in; add a product in a new colour or fabric in the admin and the filter appears) |
| `/product/:slug` | `/product/get-product/:slug`, `/reviews/product/:id(/summary)`, `/product/related-product` |
| `/blog`, `/blog/:slug` | `/features/blogs`, `/features/blogs/slug/:slug` |
| `/gallery`, `/reviews`, `/contact`, footer newsletter | `/gallery` · `/reviews/featured?limit=60` (empty until reviews are approved) · `/features/website/details` + `POST /features/contact` (`firstName,lastName,email,message`) · `POST /features/subscribe` |
| `/account` | `POST /auth/login`, `/auth/register`, `/auth/forgot-password` (security word); token + user in localStorage `ej-auth`, re-checked with `/auth/user-auth` |
| `/dashboard` | `/auth/orders`, `PUT /auth/profile`, `PUT /auth/change-password`, `PUT /auth/hide-order/:id`, `/payment-methods/list` (+ delete); the header shows Sign in / My account |
| `/cart`, `/checkout` | cart in localStorage `ej-cart` (added on product pages); shipping from `GET /shipping-rates/preview?quantity&country&subtotal`; card → `POST /payment/create-checkout-session` (or `create-guest-checkout-session`) → Stripe Checkout → back to `/success/:sessionId` → `POST /payment/verify-session` creates the order; cash on delivery → `POST /payment/cod-order` → `/order-confirmation?order=` (`GET /payment/order/:id`) |
| `/fabrics` | `/property/materials` (names, body/sleeve prices, pairings) + each material's photographed swatches from `/fabric-colors` (the section matched by name; Satin, Melton Wool, Cowhide, Sheep Nappa today) |
| `/material-colors` | every design-lab colour from `/property/colors` as a hex chip, grouped by the materials it comes in; `#<fabric section key>` links from the landing still land on the material |
| `/size-chart`, `/shipping-returns` | `/property/sizes` (measurements, surcharges) · `/shipping-rates/public` (rate table, free-shipping threshold) |
| `/track-order` | `GET /order/track?orderId&email` (new in this backend: order number + the email on the order, customer-safe fields only) |
| `/bulk-orders` | quote → `POST /features/contact` as one message (org, type, quantity, date, budget, personalization, details); FAQs from `/bulk-order` |
| every route | `<Seo />` applies the admin SEO screen's title/description/no-index for the path (`/metadata/by-path`) over the page's `usePageTitle` default |

## FAQs

Same source and behaviour as the live site: the admin's Storefront FAQs screen (`GET /features/page-faqs?pageKey=`, read-only). `Footer` renders a `PageFaqs` block for whatever the admin attached to the current route (`/about`, `/gallery`, … — nothing when a page has none); `/product/:slug` uses the `product-template` list with `{productName}` filled in; `/shop` uses the category's own list (`/varsity-jackets`) when there is one, else `catalog-template` with `{productPhrase}`; Home (`/`), `/faq` (all 42, searchable), `/bulk-orders` (`/bulk-order`) and `/design` (`/design-custom-jacket`) draw their own sections. Answers are the editor's HTML, sanitised by `safeHtml`; every list emits FAQPage JSON-LD.

**Categories.** `/faq` and `/bulk-order` group their questions (`src/lib/faqGroups.js`). A question's heading is the category set in the admin; until one is set it is filed by what it asks: the FAQ page under Ordering & payment, Design & artwork, Sizing & fit, Shipping & delivery, Returns & exchanges, Care & cleaning; the bulk page under Quotes, pricing & payment, Design & customization, Sizes & team orders, Production & shipping, Schools, brands & organizations. The admin's Storefront FAQs screen (`admin/src/Components/faqCategories.js`, same names and rule — keep the two in step) suggests the page's own headings and shows an uncategorised question's automatic heading as a dashed "· auto" chip. Nothing is written to the database until an admin saves a category.

## Fonts

Big Shoulders Display and Instrument Sans are self-hosted (`public/fonts/`, rules in `src/styles/fonts.css`, `font-display: block`) and the above-the-fold weights are preloaded from `index.html`, so text never paints in a fallback face first. Re-download with `node tools/fetch-fonts.mjs`.

## Known design-content notes

- Six links between Fabrics and Material Colors point at anchors the other page does not define (`#rib-knit`, `#lining`, `#sheep-leather`, `#cotton-twill`, `#nylon`, `#soft-shell`); they open the page at the top. Present in the export.
- The About team portraits and the Size Chart measurement diagram have no image in the design; the caption shows.
- Product and lifestyle photos are the design's own stock URLs (thejacketmaker.pk, clothoo.com), as are the "trusted by" marquee logos.

## Deploy

`Dockerfile` builds the app and serves `dist/` with nginx (`nginx.conf`, SPA
fallback to `index.html`, except `*.txt` and `/.well-known/`, which are the real file or a 404). Coolify: Dockerfile build pack, port 80.

## AI agents (Lighthouse "Agentic Browsing")

- `public/llms.txt`: what the shop sells, its key pages (relative links) and the WebMCP tools. Keep it in step when routes change.
- WebMCP tools, in browsers that offer WebMCP: `components/AgentTools.jsx` registers `lib/agentTools.js` (search_products, get_product, list_categories, list_materials_and_colors, get_size_chart, get_shipping_and_returns, get_contact_info, track_order, open_page, add_to_cart; nothing for checkout, payment or the account). Other browsers never download that code.
- Forms an agent may fill in carry `toolname` / `tooldescription` / `toolparamdescription` (newsletter, track order, contact, bulk quote, product review; `lib/webmcp.js`). Sign-in, checkout and the dashboard are left out on purpose.
