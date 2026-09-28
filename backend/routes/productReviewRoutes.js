import express from "express";
import {
  createProductReview,
  deleteProductReview,
  getAllProductReviews,
  getApprovedProductReviews,
  getProductReviewSummary,
  updateProductReview,
  getFeaturedReviews,
} from "../controllers/productReviewController.js";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/product/:productId", createProductReview);
router.get("/featured", getFeaturedReviews);
router.get("/product/:productId", getApprovedProductReviews);
router.get("/product/:productId/summary", getProductReviewSummary);

router.get("/admin", requireSignin, isAdmin, getAllProductReviews);
router.put("/admin/:id", requireSignin, isAdmin, updateProductReview);
router.delete("/admin/:id", requireSignin, isAdmin, deleteProductReview);

export default router;
