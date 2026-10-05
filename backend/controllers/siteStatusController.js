import crypto from 'crypto';
import SiteStatus from '../models/siteStatus.js';

// Site Status (models/siteStatus.js): is the public site under construction, and the private preview key.

const KEY = 'global';
const newPreviewKey = () => crypto.randomBytes(18).toString('base64url');

const sameKey = (a, b) => {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
};

const loadStatus = async () => {
  let status = await SiteStatus.findOne({ key: KEY });
  if (!status) status = await SiteStatus.create({ key: KEY, previewKey: newPreviewKey() });
  if (!status.previewKey) {
    status.previewKey = newPreviewKey();
    await status.save();
  }
  return status;
};

const adminView = (status) => ({
  success: true,
  underConstruction: status.underConstruction,
  message: status.message,
  previewKey: status.previewKey,
  updatedAt: status.updatedAt,
});

// Public: the storefront and the builder ask on load. `preview` (the visitor's stored key) says whether
// this visitor may see the site anyway; the key itself is never returned.
export const getSiteStatusController = async (req, res) => {
  try {
    const status = await loadStatus();
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      underConstruction: status.underConstruction,
      message: status.message,
      preview: sameKey(req.query.preview, status.previewKey),
    });
  } catch (error) {
    console.error('Error fetching site status:', error);
    res.status(500).json({ success: false, message: 'Error fetching site status.' });
  }
};

// Admin: everything, with the preview key for the preview link.
export const getSiteStatusAdminController = async (req, res) => {
  try {
    res.status(200).json(adminView(await loadStatus()));
  } catch (error) {
    console.error('Error fetching site status:', error);
    res.status(500).json({ success: false, message: 'Error fetching site status.' });
  }
};

// Admin: switch under construction on / off and set the message.
export const updateSiteStatusController = async (req, res) => {
  try {
    const { underConstruction, message } = req.body || {};
    if (underConstruction !== undefined && typeof underConstruction !== 'boolean') {
      return res.status(400).json({ success: false, message: 'underConstruction must be true or false.' });
    }
    if (message !== undefined && (typeof message !== 'string' || message.length > 300)) {
      return res.status(400).json({ success: false, message: 'The message must be text of at most 300 characters.' });
    }
    const status = await loadStatus();
    if (underConstruction !== undefined) status.underConstruction = underConstruction;
    if (message !== undefined) status.message = message.trim();
    await status.save();
    res.status(200).json(adminView(status));
  } catch (error) {
    console.error('Error updating site status:', error);
    res.status(500).json({ success: false, message: 'Error updating site status.' });
  }
};

// Admin: a new preview key; every preview link given out before stops working.
export const resetPreviewKeyController = async (req, res) => {
  try {
    const status = await loadStatus();
    status.previewKey = newPreviewKey();
    await status.save();
    res.status(200).json(adminView(status));
  } catch (error) {
    console.error('Error resetting the preview key:', error);
    res.status(500).json({ success: false, message: 'Error resetting the preview key.' });
  }
};
