import express from "express";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";
import {
    getPageViewsReport,
    getRealtimeReport,
    getTrafficReport,
    getCountriesReport,
    getAnalyticsConfig,
    getPublicAnalyticsConfig,
    saveAnalyticsConfig,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Routes
router.get("/public-config", getPublicAnalyticsConfig);
router.get("/config", requireSignin, isAdmin, getAnalyticsConfig);
router.post("/config", requireSignin, isAdmin, saveAnalyticsConfig);

router.get("/realtime", requireSignin, isAdmin, getRealtimeReport);
router.get("/traffic", requireSignin, isAdmin, getTrafficReport);
router.get("/page-views", requireSignin, isAdmin, getPageViewsReport);
router.get("/countries", requireSignin, isAdmin, getCountriesReport);

export default router;
