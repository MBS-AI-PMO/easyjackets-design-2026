// routes/visitorAnalyticsRoutes.js
import express from 'express';
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';
import {
  collectVisitorEvent,
  getVisitorOverview,
  getLiveVisitors,
  getVisitorSessions,
  getVisitorSessionDetail,
  getGoogleTraffic,
  purgeVisitorData,
} from '../controllers/visitorAnalyticsController.js';

const router = express.Router();

// Public — the storefront tracker posts here. No auth: visitors are anonymous.
// The unload beacon arrives as text/plain (the only JSON-carrying content type
// that avoids a CORS preflight during unload), so both types are parsed here.
router.post(
  '/collect',
  express.json({ type: ['application/json', 'text/plain'], limit: '16kb' }),
  collectVisitorEvent
);

// Admin reporting
router.get('/overview', requireSignin, isAdmin, getVisitorOverview);
router.get('/live', requireSignin, isAdmin, getLiveVisitors);
router.get('/sessions', requireSignin, isAdmin, getVisitorSessions);
// Everything that arrived from Google — landing pages, onward journey, trend.
// Registered before /sessions/:sessionId is irrelevant here (different path), but
// kept beside its siblings for readability.
router.get('/google', requireSignin, isAdmin, getGoogleTraffic);
router.get('/sessions/:sessionId', requireSignin, isAdmin, getVisitorSessionDetail);
router.delete('/purge', requireSignin, isAdmin, purgeVisitorData);

export default router;
