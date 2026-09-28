// routes/seoHealthRoutes.js
import express from 'express';
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';
import {
  getSeoPages,
  auditSeoRoute,
  auditAllRoutes,
  getSeoReport,
  saveSeoMetadata,
  uploadSocialImage,
  setRouteIndexing,
  setBulkIndexing,
} from '../controllers/seoHealthController.js';

const router = express.Router();

// Every page the site knows about, with its latest audit summary
router.get('/pages', requireSignin, isAdmin, getSeoPages);

// Full report for one route (recomputed live)
router.get('/report', requireSignin, isAdmin, getSeoReport);

// Social card upload — emits JPEG, unlike /metadata/upload which emits WebP
router.post('/upload-social-image', requireSignin, isAdmin, uploadSocialImage);

// Create or update metadata for a route — body carries the route, so paths
// with slashes (and the bare "/" homepage) survive the round trip
router.put('/metadata', requireSignin, isAdmin, saveSeoMetadata);

// Index Control — hide a page from search, or put it back. Writes to the product
// document or to `metadatas` depending on which one owns the route.
router.put('/indexing', requireSignin, isAdmin, setRouteIndexing);
router.put('/indexing/bulk', requireSignin, isAdmin, setBulkIndexing);

// Audit one route  — body: { route }
router.post('/audit', requireSignin, isAdmin, auditSeoRoute);

// Audit every route
router.post('/audit-all', requireSignin, isAdmin, auditAllRoutes);

export default router;
