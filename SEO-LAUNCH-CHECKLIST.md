# SEO launch checklist: switching easyjackets.com to the 2026 site

The new site keeps the live site's domain and addresses, so Google needs no change-of-address. These steps
make sure nothing is lost on the way. They come from the SEO audit (Oct 2026); the finding ids in brackets
point to the audit reports.

## Before launch

1. **API address: `api.easyjackets.com`** moves to the new backend (Coolify domain), with a certificate.
   Product photos, schema images and share images are served there; the stored picture addresses use it
   (they said `api2.easyjackets.com` until the launch, when they were rewritten). (N-T8)
2. **Copy `backend/uploads`** (git-ignored) onto the API's uploads volume (`/app/uploads`), including
   `uploads/blog/`: the 7 blog posts copied from the live site use 28 pictures that are only there. (N-T4, N-T20)
3. **Coolify settings**
   - Storefront: `VITE_API_URL` = the API's public address. `INDEXABLE_HOSTS` stays `easyjackets.com` (the
     Dockerfile default), so the sslip.io address stays noindex. (N-T12)
   - API: `SITEMAP_SITE_URL=https://easyjackets.com` (Dockerfile default). (N-T2)
4. **Search Console baseline**: Performance → export the last 12 months of pages and queries, and save
   them. After launch, compare against them.
5. **Uptime monitoring** (for example UptimeRobot, free): check `https://easyjackets.com/`,
   `https://easyjackets.com/robots.txt` and the API every 5 minutes, with alerts to the team. Google could
   not reach the server for 4 days in July 2026. (B-T7)
6. **Re-upload in the admin** any picture that still shows blank: a few old rows point at an image host
   that no longer exists. (N-T20)

## Launch day

1. Switch the domain to the new storefront and API.
2. Check, from a phone and with `curl` (no JavaScript):
   - `curl -sI https://www.easyjackets.com/shop` answers **301** to `https://easyjackets.com/shop`
   - `curl -s https://easyjackets.com/product/<any product> | grep -c application/ld+json` is at least 2
   - `https://easyjackets.com/robots.txt` and `/sitemap.xml` load
   - `https://easyjackets.com/google0d37a534dfb6c7fb.html` loads
   - `https://easyjackets.com/this-does-not-exist` answers **404**
3. **Search Console**: confirm *Ownership verified* (Settings → Ownership). Sitemaps → submit
   `https://easyjackets.com/sitemap.xml`. URL inspection → *Request indexing* for the home page, one
   category, one product and one blog post. Settings → robots.txt → ⋮ → *Request a recrawl*. (N-T14, L-T5)
4. **Bing Webmaster Tools**: add the site (import from Search Console), submit the sitemap. (G-4)
5. **IndexNow**: on the API in Coolify set `INDEXNOW_ENABLED=true`. From then on every product or post
   saved in the admin is sent to Bing within a minute. (G-4)
6. **Rich Results Test** (search.google.com/test/rich-results): a product, a category, a blog post and
   the home page should show Product, Breadcrumb, Article, Organization and FAQ without errors. (N-S1)

## Weeks 1–4: check every day for the first week, then twice a week

- Search Console → **Pages**: *Not found (404)* and *Soft 404*. Any old address that should still work
  gets a line in `frontend/src/data/redirects.js` (a 301 to its closest page). (N-T7, B-T5)
- Search Console → **Settings → Crawl stats**: host status green; under *By response*, 404s and server
  errors should not grow. (B-T7)
- Search Console → **Performance**: clicks and impressions for the top 20 pages and queries against the
  baseline. A drop on one page usually means a missing redirect or a changed title.
- Google Analytics: organic landing pages and conversions (mark them as key events in GA4 before launch so
  the before and after can be compared). (N-T15)

## Every month

- Ask ChatGPT, Perplexity and Google's AI Mode the same 5 questions (for example "best custom varsity
  jacket makers", "how much does a custom letterman jacket cost") and note whether Easy Jackets is named
  or linked, and which sources are cited. Ahrefs → AI citations shows the trend. (G-5)
- Search Console → Performance → queries at positions 5–20: the pages closest to page one; improve their
  title, description and opening paragraph first. (B-O7)
