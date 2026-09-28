import express from "express";
import {
  createFabricColor,
  createFabricSection,
  deleteFabricColor,
  deleteFabricSection,
  getAllFabricColors,
  getFabricColors,
  updateFabricColor,
  updateFabricSection,
} from "../controllers/fabricColorController.js";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getFabricColors);
router.get("/all", requireSignin, isAdmin, getAllFabricColors);
router.post("/sections", requireSignin, isAdmin, createFabricSection);
router.put("/sections/:id", requireSignin, isAdmin, updateFabricSection);
router.delete("/sections/:id", requireSignin, isAdmin, deleteFabricSection);
router.post("/", requireSignin, isAdmin, createFabricColor);
router.put("/:id", requireSignin, isAdmin, updateFabricColor);
router.delete("/:id", requireSignin, isAdmin, deleteFabricColor);

export default router;
