import express from 'express';
import { isAdmin, requireSignin } from '../middlewares/authMiddleware.js';
import {
    getPublicShippingRates,
    getShippingRateConfig,
    saveShippingRateConfig,
    previewShipping,
    seedDefaultShippingRates,
} from '../controllers/shippingRateController.js';

const router = express.Router();

// Public: the storefront needs these to price shipping at checkout.
router.get('/public', getPublicShippingRates);
router.get('/preview', previewShipping);

router.get('/', requireSignin, isAdmin, getShippingRateConfig);
router.put('/', requireSignin, isAdmin, saveShippingRateConfig);
router.post('/seed', requireSignin, isAdmin, seedDefaultShippingRates);

export default router;
