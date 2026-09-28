import mongoose from 'mongoose';

/**
 * A quantity bracket. `maxQty: null` means "and above", so the last tier can be
 * open-ended and any quantity always resolves to a rate.
 */
const tierSchema = new mongoose.Schema({
    minQty: { type: Number, required: true, min: 1 },
    maxQty: { type: Number, default: null },
    rate: { type: Number, required: true, min: 0 },
    // false = one flat charge for the whole order, true = rate is multiplied by quantity.
    // e.g. $60 flat for 2+ jackets, versus $60 for each jacket shipped.
    perItem: { type: Boolean, default: false },
    label: { type: String, default: '' },
}, { _id: false });

/**
 * Site-wide shipping rates, editable from the admin panel.
 *
 * USA and international are kept as separate tier lists because they are priced
 * independently - not as a multiplier of one another. Only one document is kept;
 * `key` is fixed and unique so upserts always land on it.
 */
const shippingRateSchema = new mongoose.Schema({
    key: { type: String, default: 'default', unique: true, immutable: true },

    usaTiers: { type: [tierSchema], default: [] },
    worldwideTiers: { type: [tierSchema], default: [] },

    // Used when a quantity falls outside every configured bracket, so checkout can
    // never end up with no shipping cost at all.
    usaFallbackRate: { type: Number, default: 0, min: 0 },
    worldwideFallbackRate: { type: Number, default: 0, min: 0 },

    // Order subtotal at or above which shipping is free. 0 disables it.
    freeShippingOver: { type: Number, default: 0, min: 0 },

    enabled: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('ShippingRate', shippingRateSchema);
