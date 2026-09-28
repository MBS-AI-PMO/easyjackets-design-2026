import express from 'express'
import { requireSignin } from "../middlewares/authMiddleware.js";
import { create_guest_payment_session, create_payment_session, retrieve_session, triggerWebhook, verify_session_and_create_order, getOrderById, create_cod_order } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-checkout-session', requireSignin, create_payment_session)
router.post('/create-guest-checkout-session', create_guest_payment_session)
router.post('/retrieve-session', retrieve_session)
router.post('/verify-session', verify_session_and_create_order);
router.post('/cod-order', create_cod_order);
router.get('/order/:id', getOrderById);

export default router;