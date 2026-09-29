import express from 'express';
import { isAdmin, requireSignin } from '../middlewares/authMiddleware.js';
import { getPaymentConfig, savePaymentConfig, testPaymentConfig } from '../controllers/paymentConfigController.js';

const router = express.Router();

// Stripe credentials live behind these routes, so every one of them is admin-only.
router.get('/', requireSignin, isAdmin, getPaymentConfig);
router.put('/', requireSignin, isAdmin, savePaymentConfig);
router.post('/test', requireSignin, isAdmin, testPaymentConfig);

export default router;
