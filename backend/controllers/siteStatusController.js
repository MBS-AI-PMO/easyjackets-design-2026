import SiteStatus from '../models/siteStatus.js';
import { isDeploying } from './deploymentStatusController.js';

// The "under construction" screens of the storefront, the jacket builder and the API's own address. They
// show while any of the four apps is being deployed: each app's Coolify pre-deployment command reports the
// start and its post-deployment command the end (deploy-status script in each app's folder;
// /features/deployment-status, which also clears a deploy that never reported its end after 30 minutes).
// The admin only sets the headline (models/siteStatus.js).

const KEY = 'global';

const loadText = async () => {
  let status = await SiteStatus.findOne({ key: KEY });
  if (!status) status = await SiteStatus.create({ key: KEY });
  return status;
};

// Public: the storefront and the builder ask on load and every few seconds.
export const getSiteStatusController = async (req, res) => {
  try {
    const [deploying, status] = await Promise.all([isDeploying(), loadText()]);
    res.set('Cache-Control', 'no-store');
    res.status(200).json({ success: true, underConstruction: deploying, message: status.message });
  } catch (error) {
    console.error('Error fetching site status:', error);
    res.status(500).json({ success: false, message: 'Error fetching site status.' });
  }
};

// Admin: the headline.
export const getSiteStatusAdminController = async (req, res) => {
  try {
    const status = await loadText();
    res.status(200).json({ success: true, message: status.message, updatedAt: status.updatedAt });
  } catch (error) {
    console.error('Error fetching site status:', error);
    res.status(500).json({ success: false, message: 'Error fetching site status.' });
  }
};

// Admin: change the headline.
export const updateSiteStatusController = async (req, res) => {
  try {
    const { message } = req.body || {};
    if (typeof message !== 'string' || message.length > 300) {
      return res.status(400).json({ success: false, message: 'The headline must be text of at most 300 characters.' });
    }
    const status = await loadText();
    status.message = message.trim();
    await status.save();
    res.status(200).json({ success: true, message: status.message, updatedAt: status.updatedAt });
  } catch (error) {
    console.error('Error updating site status:', error);
    res.status(500).json({ success: false, message: 'Error updating site status.' });
  }
};
