import express from 'express'
import { requireSignin } from "../middlewares/authMiddleware.js";
import { emailFormLimit, rateLimit } from '../middlewares/rateLimit.js';
import { create_guest_payment_session, create_payment_session, triggerWebhook, verify_session_and_create_order, getOrderById, create_cod_order } from '../controllers/paymentController.js';

const router = express.Router();

// each one opens a Stripe session: a real customer opens a handful, not dozens (middlewares/rateLimit.js)
const checkoutLimit = rateLimit({ name: 'checkout-session', max: 30, windowMs: 10 * 60 * 1000 });

router.post('/create-checkout-session', checkoutLimit, requireSignin, create_payment_session)
router.post('/create-guest-checkout-session', checkoutLimit, create_guest_payment_session)
// (/retrieve-session was removed: nothing used it, and it gave the buyer's details to anyone with a session id)
router.post('/verify-session', verify_session_and_create_order);
router.post('/cod-order', emailFormLimit('cod-order'), create_cod_order); // emails the order (middlewares/rateLimit.js)
router.get('/order/:id', getOrderById);

export default router;
