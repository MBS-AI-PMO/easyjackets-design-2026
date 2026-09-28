import express from 'express';
import { getSeoRenderController } from '../controllers/seoRenderController.js';

const router = express.Router();

router.get('/seo-render', getSeoRenderController);

export default router;
