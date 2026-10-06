import express from 'express';
import {
  createTag,
  getAllTags,
  getActiveTags,
  updateTag,
  deleteTag
} from '../controllers/siteTagController.js';

import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for frontend
router.get('/active', getActiveTags);

// Admin routes: a site tag can be a <script> on every page, so only admins may list, add, change or delete
// them (they used to need no login at all)
router.get('/', requireSignin, isAdmin, getAllTags);
router.post('/', requireSignin, isAdmin, createTag);
router.put('/:id', requireSignin, isAdmin, updateTag);
router.delete('/:id', requireSignin, isAdmin, deleteTag);

export default router;
