import { sendEmailInBackground } from './email.js';
import { getAdminEmail } from './emailSettings.js';
import { countHit } from './counters.js';

// Emails the admin (Settings → Email → admin address) about security events that need a person to look:
// helpers/securityEvents.js decides which. The same alert (same `key`) is sent at most once per `windowMs`,
// across every container (helpers/counters.js), so an attack does not become a flood of email.
const DEFAULT_WINDOW = 15 * 60 * 1000;

/**
 * @param {object} alert
 * @param {string} alert.key      what makes two alerts "the same" (sent once per window)
 * @param {string} alert.subject  the email's subject (prefixed "Security: ")
 * @param {string} alert.title    the headline in the email
 * @param {string} [alert.intro]  one sentence under it
 * @param {Array<[string, string]>} [alert.rows] label / value lines
 * @param {string} [alert.note]   what to do
 * @param {number} [alert.windowMs]
 */
export const sendSecurityAlert = async ({ key, subject, title, intro, rows = [], note, windowMs = DEFAULT_WINDOW }) => {
  const { count } = await countHit(`alert:${key}`, windowMs);
  if (count > 1) return; // already sent in this window
  const to = await getAdminEmail().catch(() => '');
  if (!to) {
    console.warn(`🔔 Security alert not emailed (no admin email set): ${subject}`);
    return;
  }
  console.warn(`🔔 Security alert to the admin: ${subject}`);
  sendEmailInBackground(`Security: ${subject}`, to, { title, intro, rows, note, eyebrow: 'Security alert' }, '/views/securityAlert.ejs');
};

/** The daily summary (helpers/securityDigest.js): the same template, never de-duplicated here. */
export const sendSecurityDigest = async ({ subject, title, intro, rows, sections, note }) => {
  const to = await getAdminEmail().catch(() => '');
  if (!to) {
    console.warn('🔔 Security summary not emailed (no admin email set)');
    return;
  }
  sendEmailInBackground(subject, to, { title, intro, rows, sections, note, eyebrow: 'Daily security summary' }, '/views/securityAlert.ejs');
};
