import express from "express";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";
import {
  adminLogAreas,
  adminLogSummary,
  exportAdminLogs,
  listAdminLogs,
  listSecurityEvents,
  verifyAdminLogs,
} from "../controllers/adminLogController.js";

// Admin → Activity Log (controllers/adminLogController.js). Admins only, and read only: the ledger has no
// route that changes or removes an entry.
const router = express.Router();

router.get("/", requireSignin, isAdmin, listAdminLogs);
router.get("/admins", requireSignin, isAdmin, adminLogSummary);
router.get("/areas", requireSignin, isAdmin, adminLogAreas);
router.get("/verify", requireSignin, isAdmin, verifyAdminLogs);
router.get("/export.csv", requireSignin, isAdmin, exportAdminLogs);
// every account's security events (failed sign-ins, resets, refused access …)
router.get("/security-events", requireSignin, isAdmin, listSecurityEvents);

export default router;
