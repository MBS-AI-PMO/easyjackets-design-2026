import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs'
import { getTransporter, getEmailSettings, formatFrom } from './emailSettings.js';
import { inlineCartImages } from './invoiceImages.js';
import { prepareOrderEmail } from './orderEmailData.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

/**
 * Send a templated email using the site-wide configuration managed in the admin panel.
 * Signature is unchanged from the previous env-only version so existing callers keep working.
 *
 * @param {string} subject
 * @param {string} email    recipient
 * @param {object} data     values passed to the ejs template
 * @param {string} location template path relative to this folder, e.g. '/views/otp.ejs'
 * @param {object} options  { replyTo }
 */
export const sendEmail = async (subject, email, data, location, options = {}) => {
    const settings = await getEmailSettings();

    if (!settings.enabled) {
        console.log(`✉️  Email sending is disabled in admin settings - skipped "${subject}" to ${email}`);
        return { skipped: true };
    }

    // Order emails carry product thumbnails. Left as remote URLs they are
    // blocked by most clients and, being WebP, undecodable by several more —
    // which is why an order looked fine in Gmail and empty in webmail. Only
    // payloads with a cart are touched; everything else renders as before.
    // an order: each builder design's full spec and back view, the team's copy marked (orderEmailData.js)
    const payload = Array.isArray(data?.cartData) ? await prepareOrderEmail(data, subject) : data;
    const { data: templateData, attachments: cartAttachments } = await inlineCartImages(payload);

    const html = await ejs.renderFile(__dirname + location, { data: templateData });

    const mailOptions = {
        from: formatFrom(settings),
        to: email,
        replyTo: options.replyTo || settings.replyToEmail || undefined,
        subject: `${subject}`,
        html,
        attachments: [
            // only for templates that show it (an unused inline file shows up as a stray attachment)
            ...(html.includes('cid:logo') ? [{
                filename: 'Header-logo.webp',
                path: path.join(__dirname, 'Header-logo.webp'),
                cid: 'logo' // same cid value as in the html img src
            }] : []),
            ...cartAttachments,
        ],
    };

    try {
        const transporter = await getTransporter();
        let info;
        try {
            info = await transporter.sendMail(mailOptions);
        } catch (first) {
            // one retry: a busy mail server or a dropped connection usually lets the second attempt through
            console.warn(`✉️  "${subject}" to ${email} failed (${first.code || first.message}), retrying once...`.yellow);
            await new Promise((r) => setTimeout(r, 2500));
            info = await (await getTransporter()).sendMail(mailOptions);
        }
        console.log(`✅ Email sent to ${email}:`.green, info.response);
        return info;
    } catch (error) {
        console.error("❌ CRITICAL EMAIL ERROR:".red);
        console.error("- To:".yellow, email, "| Subject:".yellow, subject);
        console.error("- Host:".yellow, `${settings.smtpHost}:${settings.smtpPort}`, "| User:".yellow, settings.smtpUser, "| From:".yellow, settings.fromEmail);
        console.error("- Message:".yellow, error.message);
        console.error("- Code:".yellow, error.code, "| Response:".yellow, error.response);
        throw error;
    }
};

/**
 * For emails sent without waiting (order confirmations): a failure is logged by sendEmail and
 * stops there. An unawaited sendEmail that failed was an unhandled rejection, which stops Node,
 * so one refused email restarted the whole backend.
 */
export const sendEmailInBackground = (...args) => sendEmail(...args).catch(() => {});
