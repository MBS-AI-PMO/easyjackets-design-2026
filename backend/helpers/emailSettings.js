import nodemailer from 'nodemailer';
import EmailConfig from '../models/emailConfigModel.js';

/**
 * Single source of truth for outgoing mail settings.
 *
 * Values come from the admin-managed EmailConfig document, falling back to the
 * EMAIL_* environment variables for any field the admin has not filled in. That keeps
 * existing deployments working before anyone opens the new admin screen.
 *
 * The resolved settings and the nodemailer transport are cached, because every send
 * would otherwise hit the database and rebuild a connection pool. Saving from the
 * admin panel calls invalidateEmailSettings() to drop the cache.
 */

let cache = null;
let cacheExpiresAt = 0;
let cachedTransporter = null;
let cachedTransporterKey = '';

/**
 * The cache is per process. invalidateEmailSettings() only clears the process that
 * handled the save, so anything running more than one worker or container would keep
 * serving stale credentials until it restarted - which is exactly how a saved config
 * can appear correct in the admin panel while the site still fails to send. The TTL
 * bounds that window: every process re-reads the config at least this often.
 */
const CACHE_TTL_MS = 60 * 1000;

export const invalidateEmailSettings = () => {
    if (cachedTransporter) {
        try { cachedTransporter.close(); } catch { /* pool may already be closed */ }
    }
    cache = null;
    cacheExpiresAt = 0;
    cachedTransporter = null;
    cachedTransporterKey = '';
};

const envDefaults = () => {
    const port = Number(process.env.EMAIL_PORT || 465);
    return {
        smtpHost: process.env.EMAIL_HOST || 'smtp.hostinger.com',
        smtpPort: port,
        smtpSecure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : port === 465,
        smtpUser: process.env.EMAIL_USER || '',
        smtpPass: process.env.EMAIL_PASS || '',
        fromName: process.env.EMAIL_FROM_NAME || 'Easy Jackets',
        fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
        replyToEmail: '',
        adminEmail: process.env.BULK_ORDER_EMAIL || process.env.ORDER_EMAIL || process.env.EMAIL_USER || '',
        enabled: true,
    };
};

/** Treat empty strings as "not configured" so they fall through to the env value. */
const pick = (dbValue, envValue) => {
    if (dbValue === undefined || dbValue === null) return envValue;
    if (typeof dbValue === 'string' && dbValue.trim() === '') return envValue;
    return dbValue;
};

export const getEmailSettings = async ({ fresh = false } = {}) => {
    if (cache && !fresh && Date.now() < cacheExpiresAt) return cache;

    const defaults = envDefaults();
    let doc = null;
    try {
        doc = await EmailConfig.findOne({ key: 'default' }).select('+smtpPass').lean();
    } catch (error) {
        console.error('Email config lookup failed, falling back to environment:', error.message);
    }

    const settings = {
        smtpHost: pick(doc?.smtpHost, defaults.smtpHost),
        smtpPort: Number(pick(doc?.smtpPort, defaults.smtpPort)),
        smtpUser: pick(doc?.smtpUser, defaults.smtpUser),
        smtpPass: pick(doc?.smtpPass, defaults.smtpPass),
        fromName: pick(doc?.fromName, defaults.fromName),
        replyToEmail: pick(doc?.replyToEmail, defaults.replyToEmail),
        enabled: doc?.enabled === undefined ? defaults.enabled : doc.enabled,
    };

    // Booleans cannot use pick() - false is a legitimate stored value
    settings.smtpSecure = doc && typeof doc.smtpSecure === 'boolean'
        ? doc.smtpSecure
        : defaults.smtpSecure;

    // From and admin addresses default to the login mailbox, which is always deliverable
    settings.fromEmail = pick(doc?.fromEmail, defaults.fromEmail) || settings.smtpUser;
    settings.adminEmail = pick(doc?.adminEmail, defaults.adminEmail) || settings.smtpUser;

    cache = settings;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return settings;
};

/**
 * Where site notifications are delivered. Every controller that used to hardcode
 * 'Order@easyjackets.com' now reads this, so changing it in the admin panel reroutes
 * order, bulk quote, contact and newsletter alerts in one place.
 */
export const getAdminEmail = async () => (await getEmailSettings()).adminEmail;

/** `"Easy Jackets" <orders@easyjackets.com>` - the header nodemailer expects. */
export const formatFrom = (settings) => (
    settings.fromName
        ? `"${settings.fromName.replace(/"/g, '')}" <${settings.fromEmail}>`
        : settings.fromEmail
);

export const buildTransporter = (settings) => nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: { user: settings.smtpUser, pass: settings.smtpPass },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
});

export const getTransporter = async () => {
    const settings = await getEmailSettings();

    // Rebuild whenever the connection details change, so a config edit picked up by the
    // TTL above cannot leave us sending through a pool built from the old credentials.
    const key = [settings.smtpHost, settings.smtpPort, settings.smtpSecure, settings.smtpUser, settings.smtpPass].join('|');
    if (cachedTransporter && cachedTransporterKey === key) return cachedTransporter;

    if (cachedTransporter) {
        try { cachedTransporter.close(); } catch { /* pool may already be closed */ }
    }
    cachedTransporter = buildTransporter(settings);
    cachedTransporterKey = key;
    return cachedTransporter;
};

/** Used by the admin "Test" action and the optional startup check. */
export const verifyEmailTransport = async (override = null) => {
    const settings = override || await getEmailSettings({ fresh: true });
    const transporter = override ? buildTransporter(settings) : await getTransporter();
    try {
        await transporter.verify();
        return { ok: true, settings };
    } catch (error) {
        return {
            ok: false,
            settings,
            code: error.code,
            message: (error.response || error.message || 'Unknown SMTP error').toString().split('\n')[0],
        };
    } finally {
        if (override) { try { transporter.close(); } catch { /* noop */ } }
    }
};
