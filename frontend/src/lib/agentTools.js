// WebMCP tools: what an AI agent in the visitor's browser may do on the storefront
// (https://developer.chrome.com/docs/ai/webmcp). components/AgentTools.jsx registers them, and
// only in a browser that offers WebMCP, so this file is loaded nowhere else.
//
// Every tool goes through the same public API calls the pages make and returns plain JSON. They
// read the catalogue, the store's policies and an order's status; two act in the browser:
// open_page moves to a page of this site, add_to_cart puts a catalogue jacket in the cart.
// Nothing here can check out, pay, sign in or read account details; the shopper does those.
import { builderUrl, customizerUrl, fetchCategories, fetchCategoryCounts, fetchProduct, fetchProducts } from './catalog';
import { fetchColorOptions, fetchShippingRates, fetchSizes, rateForQuantity, shippingRateRows } from './materials';
import { trackOrder } from './orders';
import { fetchWebsiteDetails } from './site';
import { productPath, shopPath, slugify } from './urls';
import { orderStatusSummary } from './webmcp';

// An agent waits on each call, so none may hang: a slow answer gives up after this long.
const TIMEOUT_MS = 5000;
const MAX_TEXT = 120;
const SORTS = ['popular', 'rating', 'price-asc', 'price-desc', 'new'];

// The pages open_page may open: this site's own routes only (App.jsx), never an address from the agent.
const PAGES = {
  home: '/',
  shop: '/shop',
  design_studio: '/design-custom-jacket',
  how_to_design: '/how-to-design-jacket',
  bulk_order: '/bulk-order',
  size_chart: '/sizechart',
  material_colors: '/material-colors',
  fabrics: '/fabrics',
  embroidery_and_patches: '/embroidery-and-patches',
  faq: '/faq',
  track_order: '/track-order',
  contact: '/contact-us',
  cart: '/cart',
  shipping_and_returns: '/shipping',
  privacy_policy: '/privacypolicy',
  terms: '/terms-and-conditions',
  reviews: '/reviews',
  gallery: '/gallery',
  about: '/about-us',
  blog: '/new-blog',
};

const absolute = (path) => new URL(path, window.location.origin).href;
const text = (v, max = MAX_TEXT) => String(v ?? '').trim().slice(0, max);
const clampInt = (v, min, max, fallback) => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
// the plain text of admin-written HTML (descriptions): DOMParser runs no scripts and loads nothing
const plainText = (html) => new DOMParser().parseFromString(String(html || ''), 'text/html').body.textContent || '';
const short = (html, max) => {
  const plain = plainText(html).replace(/\s+/g, ' ').trim();
  return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain;
};
/** "/product/some-jacket", a full product address or a bare slug -> the slug. */
const productSlug = (v) => {
  const s = text(v, 300);
  const m = s.match(/\/product\/([^/?#]+)/i);
  try { return decodeURIComponent(m ? m[1] : s).trim(); } catch { return (m ? m[1] : s).trim(); }
};

/** The agent's own cancel signal joined with the time limit. */
const limitSignal = (signal) => {
  const timeout = AbortSignal.timeout ? AbortSignal.timeout(TIMEOUT_MS) : undefined;
  if (signal && timeout && AbortSignal.any) return AbortSignal.any([signal, timeout]);
  return signal || timeout;
};
/** Runs a lookup within the time limit (also for helpers that take no signal, e.g. cached lists). */
const within = (promise, signal) => new Promise((resolve, reject) => {
  const stop = () => reject(new Error('The store did not answer in time. Please try again.'));
  if (signal?.aborted) { stop(); return; }
  signal?.addEventListener('abort', stop, { once: true });
  promise.then(resolve, reject).finally(() => signal?.removeEventListener('abort', stop));
});
/** A failed tool call, said plainly for the agent instead of a stack trace. */
const failure = (err, notFound) => ({
  error: err?.status === 404 && notFound ? notFound
    : err?.status === 429 ? 'Too many lookups in a short time. Please wait a minute and try again.'
    : err?.message || 'Something went wrong. Please try again.',
});

const productSummary = (p) => ({
  name: p.name,
  slug: p.slug,
  url: absolute(productPath(p.slug)),
  price_usd: p.price,
  ...(p.hasDiscount ? { original_price_usd: p.original, discount_percent: p.discountPct } : {}),
  category: p.category?.name || '',
  color: p.color?.name || '',
  materials: p.materialLabel,
  rating: p.rating || null,
  review_count: p.reviewCount || 0,
});

/**
 * The tool list. `live()` returns { navigate, cart } as of the latest render (AgentTools.jsx),
 * so a tool always acts on the current router and cart.
 */
export function createAgentTools(live) {
  return [
    {
      name: 'search_products',
      description: 'Search the Easy Jackets catalogue of ready-made custom varsity, letterman, bomber and coach jackets and hoodies. Filters by words, category, material, colour, size and price. Returns each match with its price in US dollars, category, colour, materials, rating and product page URL. Call get_product for the price of each size.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Words to look for in jacket names, for example "red satin varsity".' },
          category: { type: 'string', description: 'A category slug from list_categories, for example "varsity-jackets" or "bomber-jackets".' },
          material: { type: 'string', description: 'A material, for example "Melton Wool", "Cowhide Leather" or "Satin".' },
          color: { type: 'string', description: 'A colour name, for example "Red" or "Navy Blue".' },
          size: { type: 'string', description: 'Only jackets made in this size, for example "M", "XL" or "M/TALL".' },
          max_price: { type: 'number', minimum: 0, description: 'The highest price in US dollars.' },
          sort: { type: 'string', enum: SORTS, description: 'Order of the results: popular (default), rating, price-asc, price-desc or new.' },
          limit: { type: 'integer', minimum: 1, maximum: 24, description: 'How many products to return, 1 to 24 (default 8).' },
          page: { type: 'integer', minimum: 1, description: 'Which page of results, starting at 1.' },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input = {}, { signal } = {}) => {
        const filters = { category: slugify(text(input.category)), material: slugify(text(input.material)), color: slugify(text(input.color)), size: slugify(text(input.size)) };
        const query = text(input.query);
        const sort = SORTS.includes(input.sort) ? input.sort : 'popular';
        const maxPrice = Number(input.max_price) > 0 ? Math.round(Number(input.max_price)) : undefined;
        try {
          const r = await fetchProducts({
            page: clampInt(input.page, 1, 500, 1),
            limit: clampInt(input.limit, 1, 24, 8),
            ...filters,
            sort,
            search: query,
            maxPrice,
          }, limitSignal(signal));
          return {
            total: r.total,
            page: r.page,
            total_pages: r.totalPages,
            products: r.products.map(productSummary),
            shop_url: absolute(shopPath(filters, { q: query, sort: sort === 'popular' ? '' : sort, max: maxPrice })),
          };
        } catch (err) {
          return failure(err);
        }
      },
    },
    {
      name: 'get_product',
      description: 'Full details of one catalogue jacket: the price of each size in US dollars, colour, body and sleeve materials, category, rating, description and care, with links to its page and to the design lab to customise it.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'The product slug or product page URL, as returned by search_products.' },
        },
        required: ['slug'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input = {}, { signal } = {}) => {
        const slug = productSlug(input.slug);
        if (!slug) return { error: 'Give the product slug or its page URL.' };
        try {
          const p = await fetchProduct(slug, limitSignal(signal));
          if (!p) return { error: 'No jacket was found with that slug.' };
          return {
            ...productSummary(p),
            sizes: p.sizes.map((s) => ({ size: s.size, price_usd: s.price, ...(s.original !== s.price ? { original_price_usd: s.original } : {}) })),
            material_body: p.material.body,
            material_sleeves: p.material.sleeves,
            category_slug: p.category?.slug || '',
            summary: short(p.shortDescription, 600),
            description: short(p.description, 1500),
            care: short(p.care, 400),
            sku: p.sku,
            made_to_order: true,
            customize_url: p.designId ? customizerUrl(p) : '',
          };
        } catch (err) {
          return failure(err, 'No jacket was found with that slug.');
        }
      },
    },
    {
      name: 'list_categories',
      description: 'The jacket categories in the catalogue (varsity, cropped varsity, bomber, coach jackets, hoodies and any others), with how many products each has, its shop URL and the design lab URL to design one from scratch.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async (_input, { signal } = {}) => {
        try {
          const limit = limitSignal(signal);
          const [categories, counts] = await Promise.all([
            within(fetchCategories('jackets'), limit),
            within(fetchCategoryCounts(), limit).catch(() => []),
          ]);
          const countOf = new Map(counts.map((c) => [c.slug, c.count]));
          return {
            categories: categories.map((c) => ({
              name: c.name,
              slug: c.slug,
              product_count: countOf.get(c.slug) ?? null,
              shop_url: absolute(shopPath({ category: c.slug })),
              design_lab_url: c.code ? builderUrl({ code: c.code }) : '',
            })),
            design_studio_url: absolute(PAGES.design_studio),
          };
        } catch (err) {
          return failure(err);
        }
      },
    },
    {
      name: 'list_materials_and_colors',
      description: 'The materials custom jackets are made in (melton wool, cowhide and sheep leather, satin, fleece, twill, nylon, soft shell and more) and the colours offered in each, with hex codes.',
      inputSchema: {
        type: 'object',
        properties: {
          material: { type: 'string', description: 'Only this material, for example "Melton Wool". Leave out for all of them.' },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input = {}, { signal } = {}) => {
        try {
          const colors = await fetchColorOptions(limitSignal(signal));
          const byMaterial = new Map();
          for (const c of colors) for (const m of c.materials) {
            if (!byMaterial.has(m)) byMaterial.set(m, []);
            byMaterial.get(m).push({ name: c.name, hex: c.code || null });
          }
          const want = slugify(text(input.material));
          const materials = [...byMaterial].filter(([m]) => !want || slugify(m) === want).map(([material, list]) => ({ material, colors: list }));
          if (want && !materials.length) return { error: `No material called "${text(input.material)}". Known materials: ${[...byMaterial.keys()].join(', ')}.` };
          return { materials, colors_page_url: absolute(PAGES.material_colors), fabrics_page_url: absolute(PAGES.fabrics) };
        } catch (err) {
          return failure(err);
        }
      },
    },
    {
      name: 'get_size_chart',
      description: 'The jacket size chart, XXS to 6XL with tall sizes: the body measurements each size fits and the finished jacket measurements, in inches, plus the extra cost of the larger sizes in US dollars.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async (_input, { signal } = {}) => {
        try {
          const sizes = await fetchSizes(limitSignal(signal));
          return {
            unit: 'inches',
            sizes: sizes.map((s) => ({
              size: s.size,
              body: { chest: s.body.chest, waist: s.body.waist, sleeve: s.body.sleeves, back_length: s.body.backLength },
              jacket: { chest: s.jacket.chest, sleeve: s.jacket.sleeves, across_shoulder: s.jacket.acrossShoulder, shoulder: s.jacket.shoulder, back_length: s.jacket.backLength },
              extra_cost_usd: s.surcharge,
            })),
            how_to_measure_url: absolute(PAGES.size_chart),
          };
        } catch (err) {
          return failure(err);
        }
      },
    },
    {
      name: 'get_shipping_and_returns',
      description: 'Shipping rates in US dollars by number of jackets (United States and the rest of the world), with the cost for a given quantity and destination, plus production times, delivery times, duties, size exchanges, refunds and cancellations.',
      inputSchema: {
        type: 'object',
        properties: {
          quantity: { type: 'integer', minimum: 1, maximum: 500, description: 'Number of jackets in the order, to price its shipping.' },
          destination: { type: 'string', enum: ['united_states', 'rest_of_world'], description: 'Where the order ships: united_states (default) or rest_of_world.' },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input = {}, { signal } = {}) => {
        try {
          const rates = await fetchShippingRates(limitSignal(signal));
          const quantity = input.quantity ? clampInt(input.quantity, 1, 500, 1) : 0;
          const destination = input.destination === 'rest_of_world' ? 'rest_of_world' : 'united_states';
          // as the Shipping & Returns page shows them: a quantity no rate covers is quoted at checkout
          const price = (v) => (v === null ? 'quoted at checkout' : v);
          const quote = !quantity ? null : !rates.enabled ? 0 : destination === 'united_states'
            ? rateForQuantity(rates.usaTiers, quantity, rates.usaFallbackRate)
            : rateForQuantity(rates.worldwideTiers, quantity, rates.worldwideFallbackRate);
          return {
            currency: 'USD',
            shipping_enabled: rates.enabled,
            free_shipping_over_usd: rates.freeShippingOver || null,
            rates_per_order: rates.enabled ? shippingRateRows(rates).map((r) => ({ jackets: r.label, united_states: price(r.usa), rest_of_world: price(r.world) })) : [],
            ...(quantity ? { quote: { quantity, destination, shipping_usd: price(quote) } } : {}),
            // a summary of the Shipping & Returns page (pages/ShippingReturns.jsx), which is the full policy
            policy: {
              production: 'Made to order after the customer approves a free digital proof: about 10-12 business days for blank jackets, 2-3 weeks with chenille or embroidery; team orders of 25+ add 3-5 business days.',
              delivery: 'Shipped from the workshop in Sialkot by DHL Express or FedEx, tracked and insured: about 4-5 business days to the United States, 5-8 elsewhere.',
              duties: 'US orders under $800 clear duty-free; elsewhere local import duty or VAT may be due on delivery.',
              size_exchange: 'One free size exchange per custom jacket, requested within 14 days of delivery; the jacket must be unworn.',
              refunds: 'Custom jackets cannot be returned for a refund. Ready-made, non-customised items may be returned unworn within 30 days.',
              faults: 'A jacket that does not match the approved proof, or arrives damaged, is remade or repaired at no cost (photos within 14 days).',
              cancellation: 'Free cancellation before the proof is approved.',
            },
            policy_url: absolute(PAGES.shipping_and_returns),
          };
        } catch (err) {
          return failure(err);
        }
      },
    },
    {
      name: 'get_contact_info',
      description: 'How to reach Easy Jackets: email, phone, workshop address, opening hours and social profiles, plus the contact page with its message form.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async (_input, { signal } = {}) => {
        try {
          const site = await fetchWebsiteDetails(limitSignal(signal));
          return {
            email: site?.email || 'info@easyjackets.com',
            phone: site?.phone || '',
            addresses: (site?.addresses || []).map((a) => [a.label, ...a.lines].filter(Boolean).join(', ')),
            hours: 'Mon-Fri, 9am-6pm ET',
            reply_time: 'Within one business day',
            social: (site?.socials || []).map((s) => ({ name: s.name, url: s.url })),
            contact_page_url: absolute(PAGES.contact),
          };
        } catch (err) {
          return failure(err);
        }
      },
    },
    {
      name: 'track_order',
      description: 'The status of an order: its stage (order placed, in production, shipped, delivered or cancelled), courier, tracking number and link, status updates and the jackets in it. Needs the order number and the email address the order was placed with.',
      inputSchema: {
        type: 'object',
        properties: {
          order_number: { type: 'string', description: 'The order number from the confirmation email.' },
          email: { type: 'string', description: 'The email address the order was placed with.' },
        },
        required: ['order_number', 'email'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input = {}, { signal } = {}) => {
        const orderNumber = text(input.order_number, 60);
        const email = text(input.email, 200);
        if (!orderNumber || !email) return { error: 'Give both the order number and the email the order was placed with.' };
        try {
          const o = await trackOrder(orderNumber, email, limitSignal(signal));
          if (!o) return { error: 'No order matches that order number and email.' };
          // the status and the parcel only: no address, payment or price details
          return {
            ...orderStatusSummary(o),
            tracking_page_url: absolute(`${PAGES.track_order}?${new URLSearchParams({ order: orderNumber, email })}`),
          };
        } catch (err) {
          return failure(err, 'No order matches that order number and email.');
        }
      },
    },
    {
      name: 'open_page',
      description: 'Opens a page of the Easy Jackets site in this tab: a named page (shop, design studio, size chart, cart, FAQ, contact and so on), a product page by its slug, or a shop category by its slug, optionally with a search.',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'string', enum: [...Object.keys(PAGES), 'product', 'category'], description: 'Which page to open. "product" and "category" also need slug.' },
          slug: { type: 'string', description: 'For page "product": the product slug. For page "category": the category slug from list_categories.' },
          search: { type: 'string', description: 'For page "shop" or "category": words to search for.' },
        },
        required: ['page'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async (input = {}) => {
        const { navigate } = live();
        const slug = input.page === 'product' ? productSlug(input.slug) : slugify(text(input.slug));
        const search = text(input.search);
        let path;
        if (input.page === 'product') path = slug ? productPath(slug) : '';
        else if (input.page === 'category') path = slug ? shopPath({ category: slug }, { q: search }) : '';
        else if (input.page === 'shop') path = shopPath({}, { q: search });
        else path = PAGES[input.page] || '';
        if (!path) return { error: input.page === 'product' || input.page === 'category' ? 'This page needs a slug.' : `Unknown page. Choose one of: ${[...Object.keys(PAGES), 'product', 'category'].join(', ')}.` };
        navigate(path);
        return { opened: absolute(path) };
      },
    },
    {
      name: 'add_to_cart',
      description: 'Adds a ready-made catalogue jacket to the shopper\'s cart in a chosen size, at the price shown on its page. It does not check out or pay: the shopper reviews the cart and places the order. Custom designs are made in the design lab instead.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'The product slug or product page URL, as returned by search_products.' },
          size: { type: 'string', description: 'One of the sizes get_product lists for this jacket, for example "M" or "XL/TALL".' },
          quantity: { type: 'integer', minimum: 1, maximum: 50, description: 'How many, 1 to 50 (default 1).' },
        },
        required: ['slug', 'size'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, consequentialHint: true },
      execute: async (input = {}, { signal } = {}) => {
        const slug = productSlug(input.slug);
        const wanted = text(input.size, 20).toUpperCase();
        const qty = clampInt(input.quantity, 1, 50, 1);
        if (!slug || !wanted) return { error: 'Give the product slug and a size.' };
        try {
          const product = await fetchProduct(slug, limitSignal(signal));
          if (!product) return { error: 'No jacket was found with that slug.' };
          const chosen = product.sizes.find((s) => s.size === wanted);
          if (!chosen) {
            return product.sizes.length
              ? { error: `Size "${wanted}" is not offered for this jacket. Sizes: ${product.sizes.map((s) => s.size).join(', ')}.` }
              : { error: 'This jacket has no sizes to choose from online; open its page to order it.', url: absolute(productPath(product.slug)) };
          }
          // the same line the product page's Add to cart button makes (pages/Product.jsx)
          const { cart } = live();
          cart.add({ id: product.id, slug: product.slug, name: product.name, price: chosen.price, size: chosen.size, color: product.color?.name || '', image: product.image }, qty);
          return {
            added: { name: product.name, size: chosen.size, quantity: qty, unit_price_usd: chosen.price },
            cart_item_count: cart.count + qty,
            cart_subtotal_usd: cart.subtotal + chosen.price * qty,
            cart_url: absolute(PAGES.cart),
            next_step: 'The shopper reviews the cart and checks out themselves; shipping is added at checkout.',
          };
        } catch (err) {
          return failure(err, 'No jacket was found with that slug.');
        }
      },
    },
  ];
}
