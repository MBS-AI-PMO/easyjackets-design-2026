import express from "express";
import { attachPaymentMethod } from '../controllers/paymentMethodController.js';
import { requireSignin } from "../middlewares/authMiddleware.js";
import {
    createSetupIntent,
    savePaymentMethod,
    listPaymentMethods,
    deletePaymentMethod
} from "../controllers/paymentMethodController.js";

const router = express.Router();

// All routes require authentication
router.post('/attach', requireSignin, attachPaymentMethod);
router.post("/setup-intent", requireSignin, createSetupIntent);
router.post("/save", requireSignin, savePaymentMethod);
router.get("/list", requireSignin, listPaymentMethods);
router.delete("/:id", requireSignin, deletePaymentMethod);

export default router;
