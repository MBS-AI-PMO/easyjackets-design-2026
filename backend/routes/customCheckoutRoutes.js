import express from 'express';
import {
    createCODOrder,
    verifyCODOTP,
    createPaymentIntent,
    confirmCardPayment,
    chargeSavedCard
} from '../controllers/customCheckoutController.js';

const router = express.Router();

// COD Routes
router.post('/cod/create', createCODOrder);
router.post('/cod/verify', verifyCODOTP);

// Stripe Direct Payment Routes
router.post('/card/create-intent', createPaymentIntent);
router.post('/card/confirm', confirmCardPayment);
router.post('/card/charge-saved', chargeSavedCard);

export default router;
