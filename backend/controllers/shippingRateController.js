import ShippingRate from '../models/shippingRateModel.js';
import {
    getShippingRates,
    invalidateShippingRates,
    calculateShipping,
    describeTierIssues,
    DEFAULT_TIERS,
} from '../helpers/shippingRates.js';

/** Public - the storefront reads this to price shipping at checkout. */
export const getPublicShippingRates = async (req, res) => {
    try {
        const rates = await getShippingRates();
        res.status(200).send({ success: true, rates });
    } catch (error) {
        console.error('getPublicShippingRates failed:', error);
        res.status(500).send({ success: false, message: 'Could not load shipping rates', error: error.message });
    }
};

export const getShippingRateConfig = async (req, res) => {
    try {
        const rates = await getShippingRates({ fresh: true });
        res.status(200).send({
            success: true,
            rates,
            warnings: {
                usa: describeTierIssues(rates.usaTiers),
                worldwide: describeTierIssues(rates.worldwideTiers),
            },
        });
    } catch (error) {
        console.error('getShippingRateConfig failed:', error);
        res.status(500).send({ success: false, message: 'Could not load shipping rates', error: error.message });
    }
};

const cleanTiers = (input) => {
    if (!Array.isArray(input)) return null;
    return input
        .map((t) => {
            const minQty = Math.max(1, Math.trunc(Number(t?.minQty) || 0));
            const rawMax = t?.maxQty;
            const open = rawMax === null || rawMax === undefined || rawMax === '' || Number(rawMax) === 0;
            return {
                minQty,
                maxQty: open ? null : Math.trunc(Number(rawMax)),
                rate: Math.max(0, Number(t?.rate) || 0),
                perItem: t?.perItem === true || t?.perItem === 'true',
                label: typeof t?.label === 'string' ? t.label.trim() : '',
            };
        })
        .filter((t) => t.minQty >= 1)
        .sort((a, b) => a.minQty - b.minQty);
};

export const saveShippingRateConfig = async (req, res) => {
    try {
        const body = req.body || {};
        const update = {};

        const usa = cleanTiers(body.usaTiers);
        const worldwide = cleanTiers(body.worldwideTiers);
        if (usa) update.usaTiers = usa;
        if (worldwide) update.worldwideTiers = worldwide;

        if (body.usaFallbackRate !== undefined) update.usaFallbackRate = Math.max(0, Number(body.usaFallbackRate) || 0);
        if (body.worldwideFallbackRate !== undefined) update.worldwideFallbackRate = Math.max(0, Number(body.worldwideFallbackRate) || 0);
        if (body.freeShippingOver !== undefined) update.freeShippingOver = Math.max(0, Number(body.freeShippingOver) || 0);
        if (body.enabled !== undefined) update.enabled = body.enabled === true || body.enabled === 'true';

        await ShippingRate.findOneAndUpdate(
            { key: 'default' },
            { $set: update },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        invalidateShippingRates();
        const rates = await getShippingRates({ fresh: true });

        res.status(200).send({
            success: true,
            message: 'Shipping rates saved',
            rates,
            warnings: {
                usa: describeTierIssues(rates.usaTiers),
                worldwide: describeTierIssues(rates.worldwideTiers),
            },
        });
    } catch (error) {
        console.error('saveShippingRateConfig failed:', error);
        res.status(500).send({ success: false, message: 'Could not save shipping rates', error: error.message });
    }
};

/** Lets the admin screen show what a given quantity would actually cost. */
export const previewShipping = async (req, res) => {
    try {
        const { quantity = 1, country = '', subtotal = 0 } = req.query;
        const [usa, worldwide] = await Promise.all([
            calculateShipping(quantity, 'US', subtotal),
            calculateShipping(quantity, 'ZZ', subtotal),
        ]);
        res.status(200).send({
            success: true,
            quantity: Number(quantity),
            usa,
            worldwide,
            resolved: await calculateShipping(quantity, country, subtotal),
        });
    } catch (error) {
        console.error('previewShipping failed:', error);
        res.status(500).send({ success: false, message: 'Could not preview shipping', error: error.message });
    }
};

/** Writes the previous hardcoded storefront pricing in as a starting point. */
export const seedDefaultShippingRates = async (req, res) => {
    try {
        await ShippingRate.findOneAndUpdate(
            { key: 'default' },
            { $set: { usaTiers: DEFAULT_TIERS, worldwideTiers: DEFAULT_TIERS } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        invalidateShippingRates();
        res.status(200).send({ success: true, message: 'Seeded default rates', rates: await getShippingRates({ fresh: true }) });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Could not seed rates', error: error.message });
    }
};
