import express from 'express';
import {
  createFont,
  deleteFont,
  getActiveFonts,
  getAdminFonts,
  updateFont,
} from '../controllers/fontController.js';
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getActiveFonts);
router.get('/admin', requireSignin, isAdmin, getAdminFonts);
router.post('/', requireSignin, isAdmin, createFont);
router.put('/:id', requireSignin, isAdmin, updateFont);
router.delete('/:id', requireSignin, isAdmin, deleteFont);

export default router;
