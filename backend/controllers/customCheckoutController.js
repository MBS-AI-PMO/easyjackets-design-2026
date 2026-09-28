import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import design from '../models/design.js';
import productModel from '../models/productModel.js';
import { sendEmail } from '../helpers/email.js';
import { getAdminEmail } from '../helpers/emailSettings.js';
import randomstring from 'randomstring';
import { stripe } from '../config/stripe.js';
import { extractCardLast4 } from '../helpers/stripeHelper.js';

/**
 * Helper: Enrich cart data with full details from DB
 */
const enrichCartData = async (cartItems) => {
    const enriched = await Promise.all(cartItems.map(async (item) => {
        try {
            // A catalogue jacket is built in the customiser too, so it carries a
            // designId of its own. Branching on designId first therefore stamped
            // shop products with the studio render instead of the photographed
            // product shot. `id` is what actually separates them: the checkout
            // sends the product's _id for anything off the shelf and null for a
            // jacket the customer designed.
            const isShopProduct = Boolean(item.id) && item.id !== 'shipping_fee';
            const enrichedItem = { ...item };

            // Size and materials still come off the design either way — that is
            // where they are recorded.
            if (item.designId) {
                const designData = await design.findById(item.designId);
                if (designData) {
                    enrichedItem.size = item.size || designData.sizes?.size || 'N/A';
                    enrichedItem.materials = designData.materials || null;
                    if (!isShopProduct) {
                        enrichedItem.frontImage = designData.custom_image;
                    }
                }
            }

            if (isShopProduct) {
                const productData = await productModel.findById(item.id);
                if (productData) {
                    enrichedItem.frontImage = productData.frontImage
                        || productData.otherImages?.[0]
                        || enrichedItem.frontImage;
                    // Kept so the confirmation email can link to the product
                    // page; the cart payload has no slug of its own.
                    enrichedItem.slug = productData.slug || enrichedItem.slug;
                }
            }

            return enrichedItem;
        } catch (err) {
            console.warn(`⚠️ Failed to enrich item ${item.name}:`, err.message);
        }
        return item;
    }));
    return enriched;
};

/**
 * Create COD Order & Send OTP
 */
export const createCODOrder = async (req, res) => {
    try {
        const { products, shipping_details, buyerId, totalAmount } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // 1. Generate OTP
        const otp = randomstring.generate({
            length: 6,
            charset: 'numeric'
        });

        // 2. Format basic order data
        const randomId = Math.random().toString(36).substr(2, 8).toUpperCase();
        const timestamp = Date.now().toString().slice(-5);
        const orderId = `COD-${randomId}${timestamp}`;

        // 3. Enrich Cart Data
        const enrichedCart = await enrichCartData(products);

        // 4. Create Order (Pending Verification)
        const orderData = {
            orderId,
            transactionId: `COD-${randomId}-${timestamp}`,
            products: products.map(p => p.designId || p.id),
            totalAmount,
            totalItems: products.length,
            currency: 'usd',
            cartData: enrichedCart,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'COD',
            isCOD: true,
            codVerificationCode: otp,
            codVerified: false,
            shipping_details: Array.isArray(shipping_details) ? shipping_details : [shipping_details],
            buyer: buyerId || null,
        };

        const newOrder = await Order.create(orderData);

        // 5. Send OTP Email
        const buyerEmail = shipping_details.email || (req.user ? req.user.email : null);
        if (buyerEmail) {
            sendEmail(
                `Verify Your Order #${orderId}`,
                buyerEmail,
                { otp, orderId },
                '/views/otp.ejs'
            ).catch(err => console.error('OTP email failure:', err));
        }

        res.status(201).json({
            success: true,
            message: 'OTP sent to your email',
            orderId: newOrder._id
        });

    } catch (error) {
        console.error('❌ COD Order Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Verify COD OTP
 */
export const verifyCODOTP = async (req, res) => {
    try {
        const { orderId, otp } = req.body;

        const order = await Order.findById(orderId).select('+codVerificationCode');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.codVerified) {
            return res.status(400).json({ success: false, message: 'Order already verified' });
        }

        if (order.codVerificationCode !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        // Update order status
        order.codVerified = true;
        order.paymentStatus = 'unpaid'; // COD is usually unpaid until delivery
        await order.save();

        // 📧 SEND ORDER CONFIRMATION EMAILS
        try {
            const customerEmail = order.shipping_details[0]?.email;
            if (customerEmail) {
                // To Customer
                sendEmail(`Order Confirmed - #${order.orderId}`, customerEmail, { ...order.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs').catch(err => console.error('Customer confirmation email failure:', err));
            }
            // To Admin
            sendEmail(`New COD Order - #${order.orderId}`, await getAdminEmail(), { ...order.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs').catch(err => console.error('Admin COD notification failure:', err));
        } catch (emailErr) {
            console.error('⚠️ Failed to send confirmation emails:', emailErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Order verified successfully',
            data: order
        });

    } catch (error) {
        console.error('❌ OTP Verification Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Stripe Payment Intent (Direct Credit Card)
 */
export const createPaymentIntent = async (req, res) => {
    try {
        const { totalAmount, buyerId, products } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            metadata: {
                userId: buyerId || '',
                // We'll store a minimal cart if needed, but the frontend will handle order creation after success
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error('❌ Payment Intent Error:', error);
        res.status(500).json({ success: false, message: 'Stripe error', error: error.message });
    }
};

/**
 * Create order after successful Stripe direct payment
 */
export const confirmCardPayment = async (req, res) => {
    try {
        const { paymentIntentId, products, shipping_details, buyerId, totalAmount } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ success: false, message: 'Payment not successful' });
        }

        const randomId = Math.random().toString(36).substr(2, 8).toUpperCase();
        const timestamp = Date.now().toString().slice(-5);
        const orderId = `EJ-${randomId}${timestamp}`;

        const enrichedCart = await enrichCartData(products);

        const orderData = {
            transactionId: paymentIntentId,
            orderId,
            products: products.map(p => p.designId || p.id),
            totalAmount,
            totalItems: products.length,
            currency: 'usd',
            cartData: enrichedCart,
            status: 'pending',
            paymentStatus: 'paid',
            paymentMethod: 'Stripe',
            shipping_details: Array.isArray(shipping_details) ? shipping_details : [shipping_details],
            billing_Details: [paymentIntent.shipping || shipping_details],
            buyer: buyerId || null,
            cardLast4: await extractCardLast4(paymentIntentId)
        };

        const newOrder = await Order.create(orderData);

        // 📧 SEND ORDER CONFIRMATION EMAILS
        try {
            const customerEmail = shipping_details.email;
            if (customerEmail) {
                sendEmail(`Order Confirmation - #${orderId}`, customerEmail, { ...newOrder.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs').catch(err => console.error('Customer card order email failure:', err));
            }
            sendEmail(`New Card Order - #${orderId}`, await getAdminEmail(), { ...newOrder.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs').catch(err => console.error('Admin card order notification failure:', err));
        } catch (emailErr) {
            console.error('⚠️ Emails failed:', emailErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });

    } catch (error) {
        console.error('❌ Confirm Payment Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Charge Saved Card
 */
export const chargeSavedCard = async (req, res) => {
    try {
        const { paymentMethodId, totalAmount, products, shipping_details, buyerId } = req.body;

        if (!buyerId) {
            return res.status(400).json({ success: false, message: 'User ID is required for saved card payments' });
        }

        const user = await User.findById(buyerId);
        if (!user || !user.stripeCustomerId) {
            return res.status(400).json({ success: false, message: 'User or Stripe customer not found' });
        }

        // Create and Confirm Payment Intent in one go
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            }
        });

        if (paymentIntent.status === 'succeeded') {
            const randomId = Math.random().toString(36).substr(2, 8).toUpperCase();
            const timestamp = Date.now().toString().slice(-5);
            const orderId = `EJ-${randomId}${timestamp}`;

            const enrichedCart = await enrichCartData(products);

            const orderData = {
                transactionId: paymentIntent.id,
                orderId,
                products: products.map(p => p.designId || p.id).filter(id => id != null),
                totalAmount,
                totalItems: products.length,
                currency: 'usd',
                cartData: enrichedCart,
                status: 'pending',
                paymentStatus: 'paid',
                paymentMethod: 'Stripe',
                shipping_details: Array.isArray(shipping_details) ? shipping_details : [shipping_details],
                billing_Details: [{
                    email: user.email,
                    name: user.name,
                    address: shipping_details.address || 'N/A'
                }],
                buyer: buyerId || null,
                cardLast4: await extractCardLast4(paymentIntent.id)
            };

            const newOrder = await Order.create(orderData);

            // 📧 SEND ORDER CONFIRMATION EMAILS
            try {
                const customerEmail = shipping_details.email || user.email;
                if (customerEmail) {
                    sendEmail(`Order Confirmation - #${orderId}`, customerEmail, { ...newOrder.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs').catch(err => console.error('Customer saved card email failure:', err));
                }
                sendEmail(`New Saved Card Order - #${orderId}`, await getAdminEmail(), { ...newOrder.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs').catch(err => console.error('Admin saved card notification failure:', err));
            } catch (emailErr) {
                console.error('⚠️ Emails failed:', emailErr.message);
            }

            return res.status(201).json({
                success: true,
                message: 'Payment successful and order created',
                data: { orderId: newOrder._id }
            });
        } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_confirmation') {
            // This card requires 3D Secure verification
            return res.status(402).json({
                success: false,
                message: 'Card requires authentication',
                requiresAction: true,
                clientSecret: paymentIntent.client_secret
            });
        } else {
            return res.status(400).json({ success: false, message: `Payment failed with status: ${paymentIntent.status}` });
        }

    } catch (error) {
        console.error('❌ Charge Saved Card Error:', error);
        // Handle specific Stripe errors
        if (error.type === 'StripeCardError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Internal server error during payment', error: error.message });
    }
};
