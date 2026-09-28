import { stripe } from '../config/stripe.js';

/**
 * Helper: Extract card last 4 digits from Stripe PaymentIntent
 */
export const extractCardLast4 = async (paymentIntentId) => {
    if (!paymentIntentId) return 'N/A';
    try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ['payment_method']
        });

        // 1. Try payment_method_details (present on PI after success)
        if (pi.payment_method_details?.card?.last4) {
            return pi.payment_method_details.card.last4;
        }

        // 2. Try expanded payment_method
        if (pi.payment_method && typeof pi.payment_method === 'object' && pi.payment_method.card?.last4) {
            return pi.payment_method.card.last4;
        }

        // 3. Last fallback: explicitly retrieve PM if it's just an ID
        if (typeof pi.payment_method === 'string') {
            const pm = await stripe.paymentMethods.retrieve(pi.payment_method);
            return pm.card?.last4 || 'N/A';
        }

        return 'N/A';
    } catch (err) {
        console.error('⚠️ Card retrieval failed:', err.message);
        return 'N/A';
    }
};
