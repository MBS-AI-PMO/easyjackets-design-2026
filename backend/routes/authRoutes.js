import express from "express";
import {
  encryptUser,
  forgotPasswordController,
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
  userHideOrderController
} from "../controllers/authController.js";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register || Method Post

router.post("/register", registerController);

// Register Admin - Protected route (only admins can create admins)
router.post("/register-admin", requireSignin, isAdmin, registerAdminController);


//LOGIN || POST

router.post("/login", loginController);


router.post("/forgot-password", forgotPasswordController);

router.get("/encrypt", requireSignin, encryptUser);

router.get("/test", requireSignin, isAdmin, testController);

router.get("/allusers", getAllUsers);

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
