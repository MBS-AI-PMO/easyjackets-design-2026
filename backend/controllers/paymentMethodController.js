import PaymentMethod from "../models/paymentMethodModel.js";
import User from "../models/userModel.js";
import { stripe } from "../config/stripe.js";

/**
 * Create or get Stripe customer for user
 */
const getOrCreateStripeCustomer = async (user) => {
    if (user.stripeCustomerId) {
        try {
            await stripe.customers.retrieve(user.stripeCustomerId);
            return user.stripeCustomerId;
        } catch (err) {
            console.log('⚠️ Stripe customer not found in this mode, creating new one.');
        }
    }

    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
    });

    await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
    return customer.id;
};

/**
 * Create SetupIntent for adding a new payment method
 * POST /api/v1/payment-methods/setup-intent
 */
export const createSetupIntent = async (req, res) => {
    try {
        const customerId = await getOrCreateStripeCustomer(req.user);

        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ["card"],
            usage: "off_session", // Ensures the card is ready for future payments
        });

        res.status(200).json({
            clientSecret: setupIntent.client_secret
        });
    } catch (error) {
        console.error("SetupIntent error:", error);
        res.status(500).json({ error: "Failed to create setup intent" });
    }
};

/**
 * Save payment method after successful Stripe confirmation
 * POST /api/v1/payment-methods/save
 */
export const savePaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;

        if (!paymentMethodId) {
            return res.status(400).json({ error: "Payment method ID required" });
        }

        // 🔄 FETCH FRESH USER FROM DB (middleware req.user can be stale)
        const freshUser = await User.findById(req.user._id);
        if (!freshUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Get the Stripe customer ID
        let currentCustomerId = await getOrCreateStripeCustomer(freshUser);

        // ✅ Get payment method details from Stripe
        const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        // Check if already saved in our database
        const existing = await PaymentMethod.findOne({ stripePaymentMethodId: paymentMethodId });
        if (existing) {
            return res.status(400).json({ error: "Payment method already saved" });
        }

        // ✅ Handle customer mismatch by syncing local to Stripe
        if (stripePaymentMethod.customer && stripePaymentMethod.customer !== currentCustomerId) {
            console.warn(`♻️ Syncing local user to Stripe Customer ID: ${stripePaymentMethod.customer}`);
            await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: stripePaymentMethod.customer });
            currentCustomerId = stripePaymentMethod.customer;
        } else if (!stripePaymentMethod.customer) {
            console.log('🔗 Attaching PM to customer...');
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: currentCustomerId
            });
        }

        // ✅ CRITICAL: Set allow_redisplay to 'always' and add billing email
        await stripe.paymentMethods.update(paymentMethodId, {
            allow_redisplay: 'always',
            billing_details: {
                email: freshUser.email,
                name: freshUser.name
            }
        });

        // Save to database (only safe/masked data)
        const paymentMethod = new PaymentMethod({
            user: req.user._id,
            stripePaymentMethodId: paymentMethodId,
            type: stripePaymentMethod.type,
            card: stripePaymentMethod.card ? {
                brand: stripePaymentMethod.card.brand,
                last4: stripePaymentMethod.card.last4,
                expMonth: stripePaymentMethod.card.exp_month,
                expYear: stripePaymentMethod.card.exp_year
            } : null
        });

        await paymentMethod.save();

        res.status(201).json({
            success: true,
            message: "Payment method saved",
            paymentMethod: {
                id: paymentMethod._id,
                type: paymentMethod.type,
                card: paymentMethod.card
            }
        });
    } catch (error) {
        console.error("Save payment method error:", error);
        res.status(500).json({ error: error.message || "Failed to save payment method" });
    }
};

/**
 * List user's saved payment methods
 * GET /api/v1/payment-methods/list
 */
export const listPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            paymentMethods: paymentMethods.map(pm => ({
                id: pm._id,
                stripeId: pm.stripePaymentMethodId,
                type: pm.type,
                card: pm.card,
                isDefault: pm.isDefault,
                createdAt: pm.createdAt
            }))
        });
    } catch (error) {
        console.error("List payment methods error:", error);
        res.status(500).json({ error: "Failed to list payment methods" });
    }
};

/**
 * Delete a payment method
 * DELETE /api/v1/payment-methods/:id
 */
export const deletePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;

        const paymentMethod = await PaymentMethod.findOne({
            _id: id,
            user: req.user._id
        });

        if (!paymentMethod) {
            return res.status(404).json({ error: "Payment method not found" });
        }

        // Detach from Stripe
        try {
            await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
        } catch (detachError) {
            console.error("Stripe detach error:", detachError);
            // Continue with deletion even if Stripe detach fails
        }

        // Delete from database
        await PaymentMethod.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Payment method deleted"
        });
    } catch (error) {
        console.error("Delete payment method error:", error);
        res.status(500).json({ error: "Failed to delete payment method" });
    }
};

// Attach a payment method to the Stripe customer
export const attachPaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;

        if (!paymentMethodId) {
            return res.status(400).json({ error: "Payment method ID is required" });
        }

        // Get the user
        const user = await User.findById(req.user._id);
        if (!user.stripeCustomerId) {
            return res.status(400).json({ error: "User does not have a Stripe customer ID" });
        }

        // Attach the card to Stripe customer
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: user.stripeCustomerId
        });

        res.status(200).json({ success: true, message: "Payment method attached to customer" });
    } catch (error) {
        console.error("Attach payment method error:", error);
        res.status(500).json({ error: error.message });
    }
};

