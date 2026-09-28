// routes/metadataRoutes.js
import express from 'express';
import {
  createMetadata,
  getAvailableMetadataRoutes,
  getAllMetadata,
  getMetadataByPath,
  getMetadataByRoute,
  seedRequiredMetadata,
  updateMetadata,
  deleteMetadata,
  uploadMetadataImage
} from '../controllers/metaDataController.js';
import { requireSignin, isAdmin } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";

const router = express.Router();

// Upload Metadata Image
router.post('/upload', requireSignin, isAdmin, uploadMetadataImage);

// Sync required public SEO routes into metadata
router.post('/seed-required', requireSignin, isAdmin, seedRequiredMetadata);

// Available public SEO routes for the admin dropdown
router.get('/available-routes', requireSignin, isAdmin, getAvailableMetadataRoutes);

// Route to create metadata
router.post('/', requireSignin, isAdmin, createMetadata);

// Route to get all metadata
router.get('/', getAllMetadata);

// Route to get metadata by full path, including nested dynamic paths
router.get('/by-path', getMetadataByPath);

// Route to get metadata by route
router.get('/:route', getMetadataByRoute);

// Route to update metadata by route
router.put('/:route', requireSignin, isAdmin, updateMetadata);

// Route to delete metadata by route
router.delete('/:route', requireSignin, isAdmin, deleteMetadata);

export default router;
