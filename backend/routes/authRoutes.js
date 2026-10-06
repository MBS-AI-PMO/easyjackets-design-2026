import express from "express";
import {
  encryptUser,
  forgotPasswordController,
  resetPasswordController,
  getAllOrdersController,
  getAllUsers,
  getAllAdmins,
  getAuthenticatedUserController,
  deleteAdmin,
  getOrdersController,
  loginController,
  orderStatusController,
  registerController,
  registerAdminController,
  changePasswordController,
  testController,
  updateProfileController,
  userHideOrderController,
  logoutController
} from "../controllers/authController.js";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";
import { emailFormLimit, rateLimit } from "../middlewares/rateLimit.js";

// sign-in and sign-up per visitor (a wrong password also locks that one account for a while: authController)
const TEN_MINUTES = 10 * 60 * 1000;
const loginLimit = rateLimit({ name: "login", max: 30, windowMs: TEN_MINUTES, message: "Too many sign-in attempts. Please wait a few minutes." });
const registerLimit = rateLimit({ name: "register", max: 10, windowMs: TEN_MINUTES, message: "Too many sign-ups. Please wait a few minutes." });

const router = express.Router();

// Register || Method Post

router.post("/register", registerLimit, registerController);

// Register Admin - Protected route (only admins can create admins)
router.post("/register-admin", requireSignin, isAdmin, registerAdminController);


//LOGIN || POST

router.post("/login", loginLimit, loginController);

// logging out ends this session on the server too (controllers/authController.js)
router.post("/logout", requireSignin, logoutController);


// password reset by an emailed one-time link (controllers/authController.js)
router.post("/forgot-password", emailFormLimit("forgot-password"), forgotPasswordController);
router.post("/reset-password", resetPasswordController);

router.get("/encrypt", requireSignin, encryptUser);

router.get("/test", requireSignin, isAdmin, testController);

// the customer list (names, emails, phones, addresses): admins only
router.get("/allusers", requireSignin, isAdmin, getAllUsers);

// Get all admins (role: 1)
router.get("/alladmins", requireSignin, isAdmin, getAllAdmins);

// Delete admin (protected - only admins can delete)
router.delete("/admin/:id", requireSignin, isAdmin, deleteAdmin);
//Protected User route auth
router.get("/user-auth", requireSignin, getAuthenticatedUserController);

//protected Admin Route auth
router.get("/admin-auth", requireSignin, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

router.put("/profile", requireSignin, updateProfileController);

router.get("/orders", requireSignin, getOrdersController);

router.put("/hide-order/:orderId", requireSignin, userHideOrderController);

//all orders
router.get("/all-orders", requireSignin, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignin,
  isAdmin,
  orderStatusController
);

// Change password - for logged-in users
router.put("/change-password", requireSignin, changePasswordController);

export default router;
