// Editable storefront pages (controllers/pageContentController.js)
import express from 'express';
import { getPageContent, getPageContentDefaults, updatePageContent } from '../controllers/pageContentController.js';
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:key/defaults', requireSignin, isAdmin, getPageContentDefaults);
router.get('/:key', getPageContent);
router.put('/:key', requireSignin, isAdmin, updatePageContent);

export default router;
