import express from 'express';
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';
import {
  getSiteStatusAdminController,
  getSiteStatusController,
  updateSiteStatusController,
} from '../controllers/siteStatusController.js';

// The "under construction" screens shown while an app is deploying (controllers/siteStatusController.js).
const router = express.Router();

router.get('/', getSiteStatusController);
router.get('/admin', requireSignin, isAdmin, getSiteStatusAdminController);
router.put('/', requireSignin, isAdmin, updateSiteStatusController);

export default router;
