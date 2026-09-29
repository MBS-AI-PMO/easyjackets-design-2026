import EmailConfig from '../models/emailConfigModel.js';
import { encryptSecret } from '../helpers/secretBox.js';
import {
    getEmailSettings,
    invalidateEmailSettings,
    verifyEmailTransport,
    buildTransporter,
    formatFrom,
} from '../helpers/emailSettings.js';

const PUBLIC_FIELDS = [
    'smtpHost', 'smtpPort', 'smtpSecure', 'smtpUser',
    'fromName', 'fromEmail', 'replyToEmail', 'adminEmail', 'enabled',
];

/** Never return the stored password - only whether one is set. */
const presentSettings = (settings, doc) => ({
    ...PUBLIC_FIELDS.reduce((acc, f) => ({ ...acc, [f]: settings[f] }), {}),
    hasPassword: Boolean(settings.smtpPass),
    lastTestedAt: doc?.lastTestedAt || null,
    lastTestStatus: doc?.lastTestStatus || null,
    lastTestMessage: doc?.lastTestMessage || '',
    // Tells the admin screen which values are still coming from environment variables
    isConfigured: Boolean(doc),
});

export const getEmailConfig = async (req, res) => {
    try {
        const settings = await getEmailSettings({ fresh: true });
        const doc = await EmailConfig.findOne({ key: 'default' }).lean();
        res.status(200).send({ success: true, config: presentSettings(settings, doc) });
    } catch (error) {
        console.error('getEmailConfig failed:', error);
        res.status(500).send({ success: false, message: 'Could not load email configuration', error: error.message });
    }
};

export const saveEmailConfig = async (req, res) => {
    try {
        const body = req.body || {};
        const update = {};

        if (body.smtpHost !== undefined) update.smtpHost = String(body.smtpHost).trim();
        if (body.smtpPort !== undefined) update.smtpPort = Number(body.smtpPort) || 465;
        if (body.smtpSecure !== undefined) update.smtpSecure = body.smtpSecure === true || body.smtpSecure === 'true';
        if (body.smtpUser !== undefined) update.smtpUser = String(body.smtpUser).trim();
        if (body.fromName !== undefined) update.fromName = String(body.fromName).trim();
        if (body.fromEmail !== undefined) update.fromEmail = String(body.fromEmail).trim();
        if (body.replyToEmail !== undefined) update.replyToEmail = String(body.replyToEmail).trim();
        if (body.adminEmail !== undefined) update.adminEmail = String(body.adminEmail).trim();
        if (body.enabled !== undefined) update.enabled = body.enabled === true || body.enabled === 'true';

        // Blank password means "keep the existing one" so the admin can edit other
        // fields without retyping the credential.
        if (typeof body.smtpPass === 'string' && body.smtpPass !== '') {
            update.smtpPass = encryptSecret(body.smtpPass, 'emailconfigs.smtpPass'); // never stored in plain text
        }

        const emailish = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const field of ['fromEmail', 'replyToEmail', 'adminEmail']) {
            if (update[field] && !emailish.test(update[field])) {
                return res.status(400).send({ success: false, message: `${field} is not a valid email address.` });
            }
        }

        await EmailConfig.findOneAndUpdate(
            { key: 'default' },
            { $set: update },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        invalidateEmailSettings();

        const settings = await getEmailSettings({ fresh: true });
        const doc = await EmailConfig.findOne({ key: 'default' }).lean();
        res.status(200).send({
            success: true,
            message: 'Email configuration saved',
            config: presentSettings(settings, doc),
        });
    } catch (error) {
        console.error('saveEmailConfig failed:', error);
        res.status(500).send({ success: false, message: 'Could not save email configuration', error: error.message });
    }
};

/**
 * Verify credentials and optionally deliver a real test message.
 *
 * Accepts the same field names as save so the admin can test values before committing
 * them; anything omitted falls back to the currently stored configuration.
 */
export const testEmailConfig = async (req, res) => {
    const body = req.body || {};
    let transporter = null;

    try {
        const stored = await getEmailSettings({ fresh: true });

        const candidate = {
            smtpHost: body.smtpHost?.trim() || stored.smtpHost,
            smtpPort: Number(body.smtpPort) || stored.smtpPort,
            smtpSecure: body.smtpSecure === undefined ? stored.smtpSecure : (body.smtpSecure === true || body.smtpSecure === 'true'),
            smtpUser: body.smtpUser?.trim() || stored.smtpUser,
            smtpPass: (typeof body.smtpPass === 'string' && body.smtpPass !== '') ? body.smtpPass : stored.smtpPass,
            fromName: body.fromName?.trim() ?? stored.fromName,
            fromEmail: body.fromEmail?.trim() || stored.fromEmail,
            replyToEmail: body.replyToEmail?.trim() ?? stored.replyToEmail,
            adminEmail: body.adminEmail?.trim() || stored.adminEmail,
        };
        candidate.fromEmail = candidate.fromEmail || candidate.smtpUser;

        const recipient = (body.testRecipient || '').trim() || candidate.adminEmail || candidate.smtpUser;
        if (!recipient) {
            return res.status(400).send({ success: false, message: 'No recipient available. Set an admin email or enter a test recipient.' });
        }

        // 1. Credentials
        const verification = await verifyEmailTransport(candidate);
        if (!verification.ok) {
            await recordTest('failed', `Login failed: ${verification.message}`);
            return res.status(200).send({
                success: false,
                stage: 'authentication',
                message: `SMTP login failed for ${candidate.smtpUser}: ${verification.message}`,
                hint: verification.code === 'EAUTH'
                    ? 'Check the mailbox username and password. Aliases that only receive mail cannot be used to log in.'
                    : undefined,
            });
        }

        // 2. Real delivery
        transporter = buildTransporter(candidate);
        let usedFrom = candidate.fromEmail;
        let fromFallback = false;

        const message = {
            to: recipient,
            replyTo: candidate.replyToEmail || undefined,
            subject: 'Easy Jackets - email configuration test',
            html: testEmailHtml(candidate, recipient),
        };

        try {
            await transporter.sendMail({ ...message, from: formatFrom(candidate) });
        } catch (sendError) {
            // Many providers only allow sending as the authenticated mailbox. Retry once
            // from the login address so the admin learns the alias was rejected rather
            // than just seeing a generic failure.
            const rejectedSender = sendError.responseCode === 550 || sendError.responseCode === 553 || sendError.code === 'EENVELOPE';
            if (!rejectedSender || candidate.fromEmail === candidate.smtpUser) throw sendError;

            fromFallback = true;
            usedFrom = candidate.smtpUser;
            await transporter.sendMail({
                ...message,
                from: formatFrom({ ...candidate, fromEmail: candidate.smtpUser }),
                replyTo: candidate.replyToEmail || candidate.fromEmail,
            });
        }

        const note = fromFallback
            ? `Your mail server rejected "${candidate.fromEmail}" as a From address, so the test was sent from ${candidate.smtpUser} instead. Set From to ${candidate.smtpUser} and put ${candidate.fromEmail} in Reply-To.`
            : '';

        await recordTest('success', note || `Test email delivered to ${recipient}`);

        res.status(200).send({
            success: true,
            message: `Test email sent to ${recipient} from ${usedFrom}`,
            fromFallback,
            note,
        });
    } catch (error) {
        const detail = (error.response || error.message || 'Unknown error').toString().split('\n')[0];
        await recordTest('failed', detail);
        console.error('testEmailConfig failed:', error);
        res.status(200).send({ success: false, stage: 'send', message: `Could not send test email: ${detail}` });
    } finally {
        if (transporter) { try { transporter.close(); } catch { /* noop */ } }
    }
};

const recordTest = async (status, message) => {
    try {
        await EmailConfig.findOneAndUpdate(
            { key: 'default' },
            { $set: { lastTestedAt: new Date(), lastTestStatus: status, lastTestMessage: message } },
            { upsert: true, setDefaultsOnInsert: true }
        );
    } catch (error) {
        console.error('Could not record email test result:', error.message);
    }
};

const testEmailHtml = (settings, recipient) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#211d18">
    <h2 style="margin:0 0 16px;color:#c4703a">Email configuration works</h2>
    <p style="margin:0 0 16px;line-height:1.6">
      This is a test message from the Easy Jackets admin panel. If you are reading it, the
      site can send email with the settings below.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#6b6155">SMTP server</td><td style="padding:6px 0"><strong>${settings.smtpHost}:${settings.smtpPort}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#6b6155">Login</td><td style="padding:6px 0"><strong>${settings.smtpUser}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#6b6155">From</td><td style="padding:6px 0"><strong>${settings.fromEmail}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#6b6155">Notifications go to</td><td style="padding:6px 0"><strong>${settings.adminEmail}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#6b6155">Sent to</td><td style="padding:6px 0"><strong>${recipient}</strong></td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:12px;color:#8a8175">Sent ${new Date().toUTCString()}</p>
  </div>
`;
