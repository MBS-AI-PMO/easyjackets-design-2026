import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import { getStripeWebhookSecret, stripe } from '../config/stripe.js';
import { storefrontUrl } from '../helpers/customJacketUrl.js';

// One order per payment. The confirmation page can ask twice at once (React runs effects twice in
// development, or a reload while the first request is running) and Stripe's webhook can arrive at the
// same moment; each saw "no order yet" and created one. Work on one checkout session runs one at a time.
const confirmingSessions = new Map(); // session id -> promise of the work running for it
const oneAtATime = async (sessionId, work) => {
  while (confirmingSessions.has(sessionId)) await confirmingSessions.get(sessionId);
  let finished;
  confirmingSessions.set(sessionId, new Promise((resolve) => { finished = resolve; }));
  try {
    return await work();
  } finally {
    confirmingSessions.delete(sessionId);
    finished();
  }
};
import User from '../models/userModel.js';
import { sendEmail, sendEmailInBackground } from '../helpers/email.js';
import { getAdminEmail } from '../helpers/emailSettings.js';
import { extractCardLast4 } from '../helpers/stripeHelper.js';
import design from '../models/design.js';
import productModel from '../models/productModel.js';
import { CartError, priceCart } from '../helpers/cartPricing.js';
import { isOneEmail } from '../helpers/emailAddress.js';
import { readSignedInUser } from '../middlewares/authMiddleware.js';
import crypto from 'crypto';
import PendingCheckout from '../models/pendingCheckout.js';
import { isDomestic } from '../helpers/shippingRates.js';
import { recordSecurityEvent } from '../helpers/securityEvents.js';

// Order numbers: 8 characters from crypto randomness + the last 5 digits of the time, as before. The number
// and the email together open a guest's order page, so they must not be guessable (Math.random is).
const ORDER_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const newOrderCode = () => Array.from(crypto.randomBytes(8), (byte) => ORDER_CHARS[byte % 36]).join('');

// The countries Stripe's address form offers. A cart priced with the US rate may only be shipped to the US
// (the rate is chosen from the country the checkout page sends; Stripe's form used to accept any of these
// countries afterwards, so the cheaper US rate could be paid for a parcel going abroad).
const STRIPE_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'JP', 'NZ', 'IE', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PT', 'PL', 'CZ'];
const shippingCountriesFor = (country) => (isDomestic(country) ? ['US'] : STRIPE_COUNTRIES);

// The priced cart of a Stripe session (models/pendingCheckout.js), else the copy in Stripe's metadata (older
// sessions, or if the record is gone). Lines as { id, designId, name, quantity, price }.
const isObjectIdText = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
const cartOfSession = async (session) => {
  try {
    const saved = await PendingCheckout.findOne({ sessionId: session.id }).lean();
    if (saved?.lines?.length) return saved.lines;
  } catch (error) {
    console.error('Pending checkout lookup failed:', error.message);
  }
  let cartData = [];
  if (session.metadata?.cart) {
    try {
      cartData = JSON.parse(session.metadata.cart);
    } catch (parseErr) {
      console.error('⚠️ Failed to parse session cart metadata:', parseErr.message);
    }
  }
  if (cartData.length === 0 && session.customer) {
    try {
      const customer_data = await stripe.customers.retrieve(session.customer);
      if (customer_data.metadata?.cart) cartData = JSON.parse(customer_data.metadata.cart);
    } catch (custErr) {
      console.error('⚠️ Failed to get customer cart metadata:', custErr.message);
    }
  }
  // the short form ('d', 'n', 'q', 'p') of a cut-down cart, and no non-product lines (like 'shipping_fee')
  return cartData
    .filter((item) => !item.id || isObjectIdText(item.id))
    .map((item) => ({
      id: item.id || null,
      designId: item.designId || item.d || null,
      name: item.name || item.n || 'Unknown Product',
      quantity: item.quantity || item.q || 1,
      price: item.price || item.p || 0,
    }));
};

/**
 * Helper: Get or create Stripe customer for user
 */
const getOrCreateStripeCustomer = async (user) => {
  if (user?.stripeCustomerId) {
    try {
      await stripe.customers.retrieve(user.stripeCustomerId);

      return user.stripeCustomerId;
    } catch (err) {
      console.error('❌ Error retrieving customer:', err.message);
      if (err.statusCode === 404 || err.message.includes('No such customer')) {
        console.log('⚠️ Resetting stale Customer ID...');
        await User.findByIdAndUpdate(user._id, { stripeCustomerId: null });
        user.stripeCustomerId = null; // Update local reference for the next check
      } else {
        throw err;
      }
    }
  }

  if (!user) return null;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() }
  });

  await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
  return customer.id;
};

/**
 * Helper: Enrich cart data with full details from DB
 */
const enrichCartData = async (cartItems) => {
  const enriched = await Promise.all(cartItems.map(async (item) => {
    try {
      // A catalogue jacket is built in the customiser too, so it carries a
      // designId of its own. Branching on designId first stamped shop products
      // with the studio render instead of the photographed product shot. `id`
      // is what separates them: the product's _id off the shelf, null for a
      // jacket the customer designed.
      const isShopProduct = Boolean(item.id) && item.id !== 'shipping_fee';
      const enrichedItem = { ...item };

      // Size and materials still come off the design either way.
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
          // Kept so the confirmation email can link to the product page; the
          // cart payload has no slug of its own.
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
 * Shared logic for creating Stripe sessions
 */
/**
 * A Stripe Checkout session for a cart priced here (helpers/cartPricing.js priceCart: { lines, shipping }),
 * never at the prices the browser sends.
 */
const createStripeSession = async (priced, customerId, userId = null, country = 'US') => {
  const lineItems = priced.lines.map((line) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: String(line.name || 'Item').slice(0, 250) },
      unit_amount: Math.round(line.price * 100), // cents
    },
    quantity: line.quantity,
  }));
  if (priced.shipping > 0) {
    lineItems.push({
      price_data: { currency: 'usd', product_data: { name: 'Shipping & Handling' }, unit_amount: Math.round(priced.shipping * 100) },
      quantity: 1,
    });
  }

  // Use CLIENT_URL from environment
  let clientUrl = storefrontUrl(); // the new storefront (CLIENT_URL), never the live site

  // Store cart data in session metadata (Stripe has 500 char limit per metadata value)
  // We'll store a minimal version with short names to fit the limit
  const minimalCart = priced.lines.map(p => ({
    id: p.id,
    designId: p.designId || null,
    name: (p.name || '').substring(0, 50), // Truncate names to save space (increased from 30)
    quantity: p.quantity,
    price: p.price
  }));

  // Stringify and ensure it fits in 500 chars
  let cartString = JSON.stringify(minimalCart);
  if (cartString.length > 500) {
    // If still too long, just store essential data (keeping designId as 'd')
    const essentialCart = priced.lines.map(p => ({
      id: p.id,
      d: p.designId || null, // 'd' for designId - important for custom orders
      n: (p.name || '').substring(0, 30), // Increased from 15
      q: p.quantity,
      p: p.price
    }));
    cartString = JSON.stringify(essentialCart);
    console.log('⚠️ Cart truncated for metadata, length:', cartString.length);
  }

  const sessionOptions = {
    mode: "payment",
    line_items: lineItems,

    // Enable phone and shipping collection
    phone_number_collection: {
      enabled: true
    },
    shipping_address_collection: {
      allowed_countries: shippingCountriesFor(country)
    },

    // Store cart in session metadata for order creation
    metadata: {
      cart: cartString.substring(0, 500), // Ensure max 500 chars
      userId: userId ? String(userId) : ''
    },

    success_url: `${clientUrl}/success/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/cancel`,
  };

  // Add customer-specific options if available
  if (customerId) {
    sessionOptions.customer = customerId;

    // Enable saving payment methods for future use
    sessionOptions.payment_intent_data = {
      setup_future_usage: "off_session"
    };

    // Allow Stripe to handle saved card presentation
    sessionOptions.saved_payment_method_options = {
      payment_method_save: "enabled"
    };

    // Also update customer metadata with cart data
    try {
      await stripe.customers.update(customerId, {
        metadata: { cart: cartString.substring(0, 500) }
      });
      console.log('✅ Updated customer metadata with cart');
    } catch (updateErr) {
      console.error('⚠️ Failed to update customer metadata:', updateErr.message);
    }
  }

  const session = await stripe.checkout.sessions.create(sessionOptions);
  // the whole priced cart, for the order (Stripe's metadata above is only a fallback: 500 characters)
  try {
    await PendingCheckout.create({
      sessionId: session.id,
      lines: priced.lines.map((p) => ({ id: p.id || null, designId: p.designId || null, name: p.name, quantity: p.quantity, price: p.price })),
      shipCountry: String(country || ''),
    });
  } catch (error) {
    console.error('Pending checkout not saved (the metadata copy will be used):', error.message);
  }
  return session;
};

export const create_payment_session = async (req, res) => {
  const { products, country } = req.body; // country: the checkout form's, for the shipping rate

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "Cart is empty or invalid products provided." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('❌ User not found in DB for ID:', req.user._id);
      return res.status(404).json({ error: "User not found. Try logging out and in again." });
    }

    let customerId = null;
    try {
      customerId = await getOrCreateStripeCustomer(user);
    } catch (custError) {
      console.error('❌ Failed at getOrCreateStripeCustomer:', custError.message);
      throw new Error(`Stripe Customer Error: ${custError.message}`);
    }

    const priced = await priceCart(products, { country });
    const session = await createStripeSession(priced, customerId, user._id, country ?? 'US');
    console.log('✅ Session Created:', session.id);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    if (error instanceof CartError) return res.status(400).json({ error: error.message });
    console.error('❌ Authenticated Checkout Crash:', error);
    res.status(500).json({ error: 'The payment page could not be opened. Please try again.' });
  }
};

// A guest's checkout: no account, so no saved cards. (It used to take any account's id from the request
// and open that account's Stripe customer, showing its saved cards to whoever asked; a signed-in customer
// checks out through create_payment_session, which takes the account from the login.)
export const create_guest_payment_session = async (req, res) => {
  const { products, country } = req.body; // country: the checkout form's, for the shipping rate

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "Cart is empty or invalid products provided." });
  }

  try {
    const priced = await priceCart(products, { country });
    const session = await createStripeSession(priced, null, null, country ?? 'US');
    console.log('✅ Guest Session Created:', session.id);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    if (error instanceof CartError) return res.status(400).json({ error: error.message });
    console.error('❌ Guest Checkout Crash:', error);
    res.status(500).json({ error: 'The payment page could not be opened. Please try again.' });
  }
};

// (retrieve_session, POST /payment/retrieve-session, was removed: nothing on this site used it, and it gave
// the whole Stripe session, the buyer's name, email, phone and address, to anyone holding a session id)

export const triggerWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // the signing secret of the mode chosen in Settings -> Payment Configuration. Without one a message
    // signed with an empty key would pass, so anyone could report a "paid" order: refused instead (the
    // success page still records paid orders, checking each with Stripe).
    const webhookSecret = await getStripeWebhookSecret();
    if (!webhookSecret) {
      console.error('⚠️ Stripe webhook refused: no webhook signing secret in Settings -> Payment Configuration');
      res.status(503).send('Webhook signing secret is not configured');
      return;
    }
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    recordSecurityEvent({ type: 'webhook-signature-failed', req, details: { reason: String(err.message || '').slice(0, 120) } });
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // the cart priced when the session was made (cartOfSession: the saved copy, else Stripe's metadata)
      let cartData = await cartOfSession(session);
      if (cartData.length === 0) {
        console.warn('⚠️ No cart data found for this session!');
      }

      // ✨ ENRICH DATA (Fetch images/details from DB)
      cartData = await enrichCartData(cartData);

      // 💳 RETRIEVE PAYMENT DETAILS
      const cardLast4 = await extractCardLast4(session.payment_intent);

      const randomId = newOrderCode();
      const timestamp = Date.now().toString().slice(-5);

      // Format shipping_details as array for admin panel compatibility
      // Combine data from shipping_details and customer_details
      const formattedShippingDetails = [{
        name: session.shipping_details?.name || session.customer_details?.name || 'N/A',
        phone: session.customer_details?.phone || session.shipping_details?.phone || 'N/A',
        email: session.customer_details?.email || 'N/A',
        address: session.shipping_details?.address || session.customer_details?.address || 'N/A'
      }];

      const order = {
        transactionId: session.id,
        orderId: randomId + timestamp,
        totalAmount: session.amount_total / 100,
        totalItems: cartData.length,
        currency: session.currency,
        cartData,
        status: 'pending',
        shipping_details: formattedShippingDetails,
        billing_Details: [session.customer_details],

        // ✅ NEW FIELDS
        paymentStatus: session.payment_status === 'paid' ? 'paid' : 'unpaid',
        paymentMethod: 'Stripe',
        isCOD: false,
        cardLast4: cardLast4,
        buyer: session.metadata?.userId || null
      };

      // one order per payment: the confirmation page may be recording this session at the same moment
      const orders = await oneAtATime(session.id, async () => (await Order.findOne({ transactionId: session.id }) ? null : Order.create(order)));
      if (!orders) {
        console.log('✅ Webhook: the order for this session is already recorded');
        return res.json({ received: true });
      }
      console.log('✅ Order created:', orders.orderId);

      // 📧 SEND EMAILS
      try {
        const buyerEmail = session.customer_details?.email;
        if (buyerEmail) {
          // 1. Send to Buyer
          sendEmailInBackground(`Order Confirmation - #${orders.orderId}`, buyerEmail, { ...orders.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs');
        }

        // 2. Send to Admin (Owner)
        sendEmailInBackground(`New Order Received - #${orders.orderId}`, await getAdminEmail(), { ...orders.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs');

        console.log('📬 Order notification emails triggered');
      } catch (emailErr) {
        console.error('⚠️ Failed to trigger order emails:', emailErr.message);
      }

    } catch (err) {
      // a duplicate is the confirmation page having recorded it first: done. Anything else is answered as a
      // failure, so Stripe sends the event again later (it used to be told "received" and never retry, and
      // a buyer who did not reach the confirmation page had no order).
      if (err?.code === 11000) return res.json({ received: true });
      console.error('❌ Error processing order:', err);
      return res.status(500).json({ received: false });
    }
  }

  res.json({ received: true });
}

// A second request for the same session waits for the first, then finds and returns its order.
export const verify_session_and_create_order = (req, res) => {
  const sessionId = req.body?.session_id;
  if (!sessionId) return confirmSessionAndCreateOrder(req, res);
  return oneAtATime(sessionId, () => confirmSessionAndCreateOrder(req, res));
};

// ✅ Manual Verification Endpoint for Localhost/Fallback
const confirmSessionAndCreateOrder = async (req, res) => {
  const { session_id } = req.body;

  if (!session_id || typeof session_id !== 'string' || !/^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    console.error('❌ No session ID provided');
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // 1. Check if order already exists to prevent duplicates
    const existingOrder = await Order.findOne({ transactionId: session_id });
    if (existingOrder) {
      return res.json(await confirmationView(existingOrder, req));
    }

    // 2. Retrieve Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== 'paid') {
      console.error('❌ Payment not completed. Status:', session?.payment_status);
      return res.status(400).json({ error: 'Payment not completed or session invalid' });
    }

    // 3. The cart priced when the session was made (cartOfSession: the saved copy, else Stripe's metadata)
    let cartData = await cartOfSession(session);

    // ✨ ENRICH DATA (Fetch images/details from DB)
    cartData = await enrichCartData(cartData);

    // 4. Retrieve Card Details
    const cardLast4 = await extractCardLast4(session.payment_intent);

    const randomId = newOrderCode();
    const timestamp = Date.now().toString().slice(-5);

    // Format shipping_details as array for admin panel compatibility
    const formattedShippingDetails = [{
      name: session.shipping_details?.name || session.customer_details?.name || 'N/A',
      phone: session.customer_details?.phone || session.shipping_details?.phone || 'N/A',
      email: session.customer_details?.email || 'N/A',
      address: session.shipping_details?.address || session.customer_details?.address || 'N/A'
    }];

    // 5. Create Order
    const orderData = {
      transactionId: session.id,
      orderId: randomId + timestamp,
      totalAmount: session.amount_total / 100,
      totalItems: cartData.length,
      currency: session.currency,
      cartData,
      status: 'pending',
      shipping_details: formattedShippingDetails,
      billing_Details: [session.customer_details],
      paymentStatus: 'paid', // Verified by session status check above
      paymentMethod: 'Stripe',
      isCOD: false,
      cardLast4: cardLast4,
      buyer: session.metadata?.userId || null
    };

    const newOrder = await Order.create(orderData);
    console.log('✅ Order Manually Verified & Created:', newOrder.orderId);

    // 📧 SEND EMAILS
    try {
      const buyerEmail = session.customer_details?.email;
      if (buyerEmail) {
        // 1. Send to Buyer
        sendEmailInBackground(`Order Confirmation - #${newOrder.orderId}`, buyerEmail, { ...newOrder.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs');
      }

      // 2. Send to Admin (Owner)
      sendEmailInBackground(`New Order Received (Manual) - #${newOrder.orderId}`, await getAdminEmail(), { ...newOrder.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs');

      console.log('📬 Order notification emails triggered');
    } catch (emailErr) {
      console.error('⚠️ Failed to trigger order emails:', emailErr.message);
    }

    res.json(newOrder);

  } catch (error) {
    // Handle race condition (Duplicate Key Error)
    if (error.code === 11000) {
      const existingOrder = await Order.findOne({ transactionId: session_id });
      return res.json(await confirmationView(existingOrder, req));
    }

    console.error('❌ Error verifying session:', error);
    res.status(500).json({ error: 'The payment could not be confirmed yet. Please refresh this page in a minute.' });
  }
};

// The confirmation page (/success/<session id>) asks again on reload. The full order (name, address, items) is
// given for CONFIRMATION_HOURS after it was placed, or to its signed-in buyer or an admin; after that a link
// that leaked (browser history, an analytics tag) shows only the number and the state. The confirmation email
// links to the order page, which checks the email (getOrderById).
const CONFIRMATION_HOURS = 24;
const confirmationView = async (order, req) => {
  if (!order) return order;
  const fresh = Date.now() - new Date(order.createdAt || 0).getTime() < CONFIRMATION_HOURS * 60 * 60 * 1000;
  if (fresh) return order;
  const viewer = await readSignedInUser(req);
  if (viewer && (viewer.role === 1 || String(order.buyer || '') === String(viewer._id))) return order;
  return { orderId: order.orderId, status: order.status, paymentStatus: order.paymentStatus, createdAt: order.createdAt, limited: true };
};

// Get single order by ID or orderId: the confirmation page. Only for whoever placed it: the email it was
// placed with (?email=, kept by the checkout in that browser), or the signed-in buyer, or an admin. (It used
// to give anyone with an order number the buyer's name, address, phone and email.)
const sameEmail = (a, b) => Boolean(a) && Boolean(b) && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { orderId: id }
      ]
    }).populate('buyer', 'name email').populate('products').populate('cartData.id').populate('cartData.designId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const email = typeof req.query.email === 'string' ? req.query.email : '';
    const orderEmails = [order.shipping_details?.[0]?.email, order.billing_Details?.[0]?.email, order.buyer?.email];
    let allowed = orderEmails.some((e) => sameEmail(e, email));
    if (!allowed) {
      const viewer = await readSignedInUser(req);
      allowed = Boolean(viewer) && (viewer.role === 1 || String(order.buyer?._id || order.buyer || '') === String(viewer._id));
    }
    if (!allowed) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('❌ Get Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const create_cod_order = async (req, res) => {
  // the buyer is whoever is signed in (their token), never an account id sent in the request
  const { products, formDetails, country } = req.body; // country: the checkout form's, for the shipping rate

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "Cart is empty or invalid products provided." });
  }
  if (!formDetails || typeof formDetails !== 'object' || !isOneEmail(formDetails.email)) {
    return res.status(400).json({ error: "Please enter one valid email address." });
  }

  try {
    const buyer = await readSignedInUser(req);
    // 1. The cart priced here (the prices and shipping line the browser sends are not used), with the shipping
    // rate of the address the order goes to
    const priced = await priceCart(products, { country: formDetails.country || country });
    let cartData = await enrichCartData(priced.lines);

    // 2. The amount to collect: the priced cart and its shipping
    const totalAmount = priced.total;

    const randomId = newOrderCode();
    const timestamp = Date.now().toString().slice(-5);

    // 3. Format Details
    const formattedShippingDetails = [{
      name: `${formDetails.firstName} ${formDetails.lastName}`,
      phone: formDetails.phone,
      email: formDetails.email,
      address: {
        line1: formDetails.address,
        city: formDetails.city,
        state: formDetails.state,
        postal_code: formDetails.zip,
        country: formDetails.country
      }
    }];

    // 4. Create Order
    const orderData = {
      transactionId: `COD-${randomId}-${timestamp}`, // Custom ID for COD
      orderId: randomId + timestamp,
      totalAmount: totalAmount,
      totalItems: cartData.length,
      currency: 'usd', // Default
      cartData,
      status: 'pending',
      shipping_details: formattedShippingDetails,
      billing_Details: formattedShippingDetails, // Assuming same for COD if not split
      // paymentStatus: 'pending', // IMPORTANT: Pending payment
      paymentStatus: 'unpaid', // IMPORTANT: Unpaid payment
      paymentMethod: 'COD',
      isCOD: true,
      cardLast4: 'N/A',
      buyer: buyer?._id || null
    };

    const newOrder = await Order.create(orderData);
    console.log('✅ COD Order Created:', newOrder.orderId);

    // 5. Send Emails
    try {
      const buyerEmail = formDetails.email;
      if (buyerEmail) {
        sendEmailInBackground(`Order Confirmation - #${newOrder.orderId}`, buyerEmail, { ...newOrder.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs');
      }
      sendEmailInBackground(`New COD Order Received - #${newOrder.orderId}`, await getAdminEmail(), { ...newOrder.toObject(), clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' }, '/views/orderInvoice.ejs');
    } catch (emailErr) {
      console.error('⚠️ Failed to trigger COD emails:', emailErr.message);
    }

    res.status(200).json({ success: true, orderId: newOrder.orderId });

  } catch (error) {
    if (error instanceof CartError) return res.status(400).json({ error: error.message });
    console.error('❌ COD Checkout Error:', error);
    res.status(500).json({ error: 'The order could not be placed. Please try again.' });
  }
};