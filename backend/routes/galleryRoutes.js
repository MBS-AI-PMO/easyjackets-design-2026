import express from "express";
import {
    uploadGalleryImage,
    getGalleryImages,
    getAllGalleryImages,
    updateGalleryImage,
    deleteGalleryImage,
    permanentDeleteGalleryImage,
} from "../controllers/galleryController.js";
import { requireSignin, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route - Get gallery images with pagination
router.get("/", getGalleryImages);

// Admin routes - Protected
router.post("/", requireSignin, isAdmin, uploadGalleryImage);
router.get("/all", requireSignin, isAdmin, getAllGalleryImages);
router.put("/:id", requireSignin, isAdmin, updateGalleryImage);
router.delete("/:id", requireSignin, isAdmin, deleteGalleryImage);
router.delete("/permanent/:id", requireSignin, isAdmin, permanentDeleteGalleryImage);

export default router;
