import express from 'express';
import { isAdmin, requireSignin } from '../middlewares/authMiddleware.js';
import {
    getEmailConfig,
    saveEmailConfig,
    testEmailConfig,
} from '../controllers/emailConfigController.js';

const router = express.Router();

// Credentials live behind these routes, so every one of them is admin-only.
router.get('/', requireSignin, isAdmin, getEmailConfig);
router.put('/', requireSignin, isAdmin, saveEmailConfig);
router.post('/test', requireSignin, isAdmin, testEmailConfig);

export default router;
