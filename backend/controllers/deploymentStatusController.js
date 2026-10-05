import crypto from 'crypto';
import DeploymentStatus from '../models/deploymentStatus.js';

const DEFAULT_MESSAGE = 'The site is under construction';
const STATUS_KEY = 'global';
const DEFAULT_TTL_MINUTES = 30;

const allowedServices = new Set([
  'easyjackets',
  'custom-jacket',
  'admin-easyjacket',
  'node-backend',
]);

const cleanText = (value) => String(value || '').trim();

const getTtlMs = () => {
  const minutes = Number(process.env.DEPLOYMENT_STATUS_TTL_MINUTES);
  const safeMinutes = Number.isFinite(minutes) && minutes > 0
    ? minutes
    : DEFAULT_TTL_MINUTES;
  return safeMinutes * 60 * 1000;
};

const timingSafeEqual = (a, b) => {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const getRequestToken = (req) => {
  const headerToken = req.get('x-deployment-token');
  const authHeader = req.get('authorization') || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : '';

  return cleanText(headerToken || bearerToken);
};

const requireDeploymentToken = (req, res) => {
  const expectedToken = cleanText(process.env.DEPLOYMENT_STATUS_TOKEN);
  if (!expectedToken) {
    res.status(503).json({
      success: false,
      message: 'Deployment status token is not configured.',
    });
    return false;
  }

  if (!timingSafeEqual(getRequestToken(req), expectedToken)) {
    res.status(401).json({ success: false, message: 'Invalid deployment token.' });
    return false;
  }

  return true;
};

const getDeploymentStatus = async () => {
  let status = await DeploymentStatus.findOne({ key: STATUS_KEY });
  if (status) return status;

  status = await DeploymentStatus.create({
    key: STATUS_KEY,
    message: DEFAULT_MESSAGE,
    activeDeployments: [],
  });

  return status;
};

const pruneExpiredDeployments = (status) => {
  const cutoff = Date.now() - getTtlMs();
  const current = status.activeDeployments || [];
  const active = current.filter((entry) => {
    const startedAt = entry?.startedAt ? new Date(entry.startedAt).getTime() : 0;
    return Number.isFinite(startedAt) && startedAt >= cutoff;
  });

  if (active.length !== current.length) {
    status.activeDeployments = active;
    return true;
  }

  return false;
};

const formatStatus = (status) => {
  const activeDeployments = (status.activeDeployments || []).map((entry) => ({
    service: entry.service,
    startedAt: entry.startedAt,
  }));

  return {
    success: true,
    active: activeDeployments.length > 0,
    message: status.message || DEFAULT_MESSAGE,
    activeDeployments,
    updatedAt: status.updatedAt,
  };
};

const readStatus = async () => {
  const status = await getDeploymentStatus();
  const changed = pruneExpiredDeployments(status);
  if (changed) await status.save();
  return status;
};

/** Is any of the four apps being deployed right now? (controllers/siteStatusController.js, helpers/holdingPage.js) */
export const isDeploying = async () => {
  const status = await readStatus();
  return (status.activeDeployments || []).length > 0;
};

export const getDeploymentStatusController = async (req, res) => {
  try {
    const status = await readStatus();
    res.status(200).json(formatStatus(status));
  } catch (error) {
    console.error('Error fetching deployment status:', error);
    res.status(500).json({ success: false, message: 'Error fetching deployment status.' });
  }
};

export const startDeploymentStatusController = async (req, res) => {
  try {
    if (!requireDeploymentToken(req, res)) return;

    const service = cleanText(req.body.service);
    if (!allowedServices.has(service)) {
      return res.status(400).json({
        success: false,
        message: 'Service must be one of easyjackets, custom-jacket, admin-easyjacket, node-backend.',
      });
    }

    const status = await readStatus();
    const activeDeployments = status.activeDeployments || [];
    const existing = activeDeployments.find((entry) => entry.service === service);

    if (existing) {
      existing.startedAt = new Date();
    } else {
      activeDeployments.push({ service, startedAt: new Date() });
    }

    const message = cleanText(req.body.message);
    status.message = message || DEFAULT_MESSAGE;
    status.activeDeployments = activeDeployments;
    await status.save();

    res.status(200).json(formatStatus(status));
  } catch (error) {
    console.error('Error starting deployment status:', error);
    res.status(500).json({ success: false, message: 'Error starting deployment status.' });
  }
};

export const finishDeploymentStatusController = async (req, res) => {
  try {
    if (!requireDeploymentToken(req, res)) return;

    const service = cleanText(req.body.service);
    if (!allowedServices.has(service)) {
      return res.status(400).json({
        success: false,
        message: 'Service must be one of easyjackets, custom-jacket, admin-easyjacket, node-backend.',
      });
    }

    const status = await readStatus();
    status.activeDeployments = (status.activeDeployments || [])
      .filter((entry) => entry.service !== service);
    await status.save();

    res.status(200).json(formatStatus(status));
  } catch (error) {
    console.error('Error finishing deployment status:', error);
    res.status(500).json({ success: false, message: 'Error finishing deployment status.' });
  }
};
