import express from "express";
import {
  activateAndDeactivateProduct,
  brainTreePaymentController,
  braintreeTokenController,
  createDraftProduct,
  createProductController,
  backfillProductSeoController,
  deleteProductController,
  duplicateProduct,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productCategoryCountsController,
  productFilterOptionsController,
  productCutoutsController,
  landingController,
  productFiltersController,
  productListController,
  productPhotoController,
  realtedProductController,
  searchProductController,
  updateProductController,
  recordProductView,
  recordProductClick,
  getTopProducts,
} from "../controllers/productController.js";
import { googleShoppingFeed } from "../controllers/googleFeedController.js";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";

const router = express.Router();

//routes
router.post(
  "/create/:cid",
  requireSignin,
  isAdmin,
  createDraftProduct
);

router.post(
  "/create-product",
  requireSignin,
  isAdmin,
  // formidable(),
  createProductController
);
//routes
router.put(
  "/update-product/:pid",
  requireSignin,
  isAdmin,
  // formidable({ multiple : true}),
  updateProductController
);

router.put(
  "/active/:pid",
  requireSignin,
  isAdmin,
  activateAndDeactivateProduct
);

//get products
router.get("/get-product", getProductController);

//single product
router.get("/get-product/:id", getSingleProductController);

router.post("/duplicate-product/:id", requireSignin, isAdmin, duplicateProduct)

router.post(
  "/backfill-seo",
  requireSignin,
  isAdmin,
  backfillProductSeoController
);

//get photo
router.get("/product-photo/:pid/:index", productPhotoController);

//delete rproduct
router.delete("/delete-product/:pid", requireSignin, isAdmin, deleteProductController);

router.get("/product-filters", productFiltersController);

router.get("/product-count", productCountController);
router.get("/category-counts", productCategoryCountsController);
router.get("/filter-options", productFilterOptionsController);
router.get("/cutouts", productCutoutsController);
router.get("/landing", landingController);

router.get("/product-list/:page", productListController);

router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", realtedProductController);

//category wise product
router.get("/product-category/:slug", productCategoryController);

router.get("/braintree/token", braintreeTokenController);

//payments
router.post("/braintree/payment", requireSignin, brainTreePaymentController);

// --- PRODUCT ANALYTICS ---
router.post("/interaction/:id/view", recordProductView);
router.post("/interaction/:id/click", recordProductClick);
router.get("/analytics/top", getTopProducts);

// --- GOOGLE SHOPPING FEED (public, no auth required) ---
router.get("/google-feed", googleShoppingFeed);

export default router;
