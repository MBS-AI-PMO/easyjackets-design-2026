// What the order emails (helpers/views/orderInvoice.ejs) need beyond the order itself: for every
// jacket designed in the builder, its saved design (the full build, colors and artwork, its back
// view and a link to its review page on the storefront), which copy this is (the customer's or
// the team's) and the storefront's address. Nothing here may cost an email: on any failure the
// order is sent as it is.
import Design from '../models/design.js';
import { designReviewUrl, storefrontUrl } from './customJacketUrl.js';
import { designSummary } from './designSummary.js';

const isShipping = (item) => item?.id === 'shipping_fee';
const isCustom = (item) => !item?.id && Boolean(item?.designId || item?.d);

/**
 * @param {object} data     the order (as passed to sendEmail)
 * @param {string} subject  the email's subject: "New ..." marks the team's copy
 */
export const prepareOrderEmail = async (data, subject = '') => {
    const items = Array.isArray(data?.cartData) ? data.cartData : [];
    const base = { ...data, forAdmin: /^New\b/i.test(String(subject)), siteUrl: storefrontUrl() };
    if (!items.length) return base;

    let designs = new Map();
    const ids = [...new Set(items.filter(isCustom).map((i) => String(i.designId || i.d)))].filter((id) => /^[0-9a-f]{24}$/i.test(id));
    if (ids.length) {
        try {
            const found = await Design.find({ _id: { $in: ids } })
                .select('categoryCode materials styles colors sizes designs advance globals.catName custom_image custom_image_back custom_price')
                .lean();
            designs = new Map(found.map((d) => [String(d._id), d]));
        } catch (error) {
            console.warn('Order email: the designs could not be read, sending without them:', error.message);
        }
    }

    const cartData = items.filter((i) => !isShipping(i)).map((item) => {
        if (!isCustom(item)) return item;
        const d = designs.get(String(item.designId || item.d));
        if (!d) return { ...item, custom: true };
        return {
            ...item,
            custom: true,
            summary: designSummary(d),
            frontImage: item.frontImage || d.custom_image || '',
            backImage: d.custom_image_back || '',
            reviewUrl: designReviewUrl(d._id),
        };
    });
    const shippingLine = items.find(isShipping);
    return { ...base, cartData, shippingLine: shippingLine ? Number(shippingLine.price) * (Number(shippingLine.quantity) || 1) : null };
};
