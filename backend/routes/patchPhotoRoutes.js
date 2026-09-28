import express from "express";
import {
    uploadPatchPhoto,
    getPatchPhotos,
    getAllPatchPhotos,
    updatePatchPhoto,
    deletePatchPhoto,
    permanentDeletePatchPhoto,
} from "../controllers/patchPhotoController.js";
import { requireSignin, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: active photos (optionally ?tag=Chenille), newest first
router.get("/", getPatchPhotos);

// Admin
router.post("/", requireSignin, isAdmin, uploadPatchPhoto);
router.get("/all", requireSignin, isAdmin, getAllPatchPhotos);
router.put("/:id", requireSignin, isAdmin, updatePatchPhoto);
router.delete("/:id", requireSignin, isAdmin, deletePatchPhoto);
router.delete("/permanent/:id", requireSignin, isAdmin, permanentDeletePatchPhoto);

export default router;
