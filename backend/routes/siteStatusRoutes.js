import express from 'express';
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';
import {
  getSiteStatusAdminController,
  getSiteStatusController,
  resetPreviewKeyController,
  updateSiteStatusController,
} from '../controllers/siteStatusController.js';

// Under construction for the public site (controllers/siteStatusController.js).
const router = express.Router();

router.get('/', getSiteStatusController);
router.get('/admin', requireSignin, isAdmin, getSiteStatusAdminController);
router.put('/', requireSignin, isAdmin, updateSiteStatusController);
router.post('/preview-key', requireSignin, isAdmin, resetPreviewKeyController);

export default router;
