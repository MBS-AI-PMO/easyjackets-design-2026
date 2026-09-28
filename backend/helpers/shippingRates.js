import ShippingRate from '../models/shippingRateModel.js';

/**
 * Shipping rate resolution, shared by the public API and any server-side pricing.
 *
 * Mirrors the storefront's previous hardcoded behaviour (1 jacket $30, 2+ $60) as the
 * seed defaults, so nothing changes in price until an admin edits the rates.
 */

export const DEFAULT_TIERS = [
    { minQty: 1, maxQty: 1, rate: 30, label: 'Single jacket' },
    { minQty: 2, maxQty: null, rate: 60, label: '2 or more' },
];

const CACHE_TTL_MS = 60 * 1000;
let cache = null;
let cacheExpiresAt = 0;

export const invalidateShippingRates = () => {
    cache = null;
    cacheExpiresAt = 0;
};

/** Country values that count as domestic. Compared case-insensitively. */
const USA_ALIASES = new Set([
    'us', 'usa', 'u.s.', 'u.s.a.', 'united states', 'united states of america', 'america',
]);

export const isDomestic = (country) => {
    if (!country) return false;
    return USA_ALIASES.has(String(country).trim().toLowerCase());
};

export const getShippingRates = async ({ fresh = false } = {}) => {
    if (cache && !fresh && Date.now() < cacheExpiresAt) return cache;

    let doc = null;
    try {
        doc = await ShippingRate.findOne({ key: 'default' }).lean();
    } catch (error) {
        console.error('Shipping rate lookup failed, using defaults:', error.message);
    }

    const rates = {
        usaTiers: doc?.usaTiers?.length ? doc.usaTiers : DEFAULT_TIERS,
        worldwideTiers: doc?.worldwideTiers?.length ? doc.worldwideTiers : DEFAULT_TIERS,
        usaFallbackRate: doc?.usaFallbackRate ?? 0,
        worldwideFallbackRate: doc?.worldwideFallbackRate ?? 0,
        freeShippingOver: doc?.freeShippingOver ?? 0,
        enabled: doc?.enabled === undefined ? true : doc.enabled,
        isConfigured: Boolean(doc),
    };

    cache = rates;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return rates;
};

/**
 * Pick the rate for a quantity. Tiers are sorted by minQty and the first bracket that
 * contains the quantity wins, so overlapping brackets resolve predictably rather than
 * depending on the order rows happen to be stored in.
 */
export const rateForQuantity = (tiers, quantity, fallbackRate = 0) => {
    const qty = Math.max(0, Math.trunc(Number(quantity) || 0));
    if (qty === 0) return 0;

    const sorted = [...(tiers || [])]
        .filter((t) => Number.isFinite(Number(t?.minQty)) && Number.isFinite(Number(t?.rate)))
        .sort((a, b) => Number(a.minQty) - Number(b.minQty));

    for (const tier of sorted) {
        const min = Number(tier.minQty);
        const max = tier.maxQty === null || tier.maxQty === undefined || tier.maxQty === ''
            ? Infinity
            : Number(tier.maxQty);
        if (qty >= min && qty <= max) {
            // A per-item tier charges its rate for every jacket; otherwise the rate is
            // one flat charge covering the whole order.
            return tier.perItem ? Number(tier.rate) * qty : Number(tier.rate);
        }
    }
    return Number(fallbackRate) || 0;
};

/**
 * @param {number} quantity total items being shipped
 * @param {string} country  destination country; anything not recognised as USA is international
 * @param {number} subtotal order subtotal, used only for the free-shipping threshold
 */
export const calculateShipping = async (quantity, country, subtotal = 0) => {
    const rates = await getShippingRates();
    if (!rates.enabled) return 0;
    if (rates.freeShippingOver > 0 && Number(subtotal) >= rates.freeShippingOver) return 0;

    return isDomestic(country)
        ? rateForQuantity(rates.usaTiers, quantity, rates.usaFallbackRate)
        : rateForQuantity(rates.worldwideTiers, quantity, rates.worldwideFallbackRate);
};

/** Overlaps and gaps are reported, not rejected - the admin may be mid-edit. */
export const describeTierIssues = (tiers) => {
    const issues = [];
    const sorted = [...(tiers || [])].sort((a, b) => Number(a.minQty) - Number(b.minQty));

    sorted.forEach((tier, i) => {
        const min = Number(tier.minQty);
        const max = tier.maxQty === null || tier.maxQty === undefined || tier.maxQty === ''
            ? Infinity
            : Number(tier.maxQty);

        if (max < min) issues.push(`Range starting at ${min} ends before it begins.`);

        const next = sorted[i + 1];
        if (!next) return;
        const nextMin = Number(next.minQty);
        if (max === Infinity) issues.push(`The open-ended range from ${min} hides later ranges.`);
        else if (nextMin <= max) issues.push(`Ranges ${min}-${max} and ${nextMin}+ overlap.`);
        else if (nextMin > max + 1) issues.push(`No rate set for quantities ${max + 1}-${nextMin - 1}.`);
    });

    if (sorted.length && Number(sorted[0].minQty) > 1) {
        issues.push(`No rate set for quantities 1-${Number(sorted[0].minQty) - 1}.`);
    }
    return issues;
};
