import express from 'express';
import {
  createTag,
  getAllTags,
  getActiveTags,
  updateTag,
  deleteTag
} from '../controllers/siteTagController.js';

// Assuming there's an auth middleware, we could import it here to protect admin routes
// import { requireSignIn, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for frontend
router.get('/active', getActiveTags);

// Admin routes
// NOTE: Add requireSignIn, isAdmin middlewares if you want to secure these
router.get('/', getAllTags);
router.post('/', createTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;
