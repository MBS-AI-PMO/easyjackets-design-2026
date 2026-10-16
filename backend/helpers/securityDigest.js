import SecurityEvent from '../models/securityEvent.js';
import { countHit } from './counters.js';
import { verifyLedger } from './adminLedger.js';
import { sendSecurityDigest } from './securityAlerts.js';
import { recordSecurityEvent } from './securityEvents.js';

// Once a day (after DIGEST_HOUR_UTC), the admin address gets a short security summary:
//   - the last 24 hours' security events by kind, and the addresses with the most failed sign-ins
//   - the admin activity log's integrity check, and its newest entry's number and hash. That hash, kept in
//     the admin's inbox, is the copy outside the database: a log rewritten later no longer matches it.
// Sent once per day across every container (helpers/counters.js). If the check fails, an alert is sent at once.
const DIGEST_HOUR_UTC = 6;
const CHECK_EVERY = 60 * 60 * 1000;

const LABELS = {
  'login-failed': 'Wrong passwords',
  'login-locked': 'Sign-ins locked',
  'password-reset-requested': 'Password reset emails asked for',
  'password-reset': 'Passwords reset',
  'password-changed': 'Passwords changed',
  'email-changed': 'Account emails changed',
  'admin-denied': 'Refused admin access',
  'session-revoked-use': 'Ended sessions used again',
  'rate-limited': 'Visitors slowed down by a limit',
  'webhook-signature-failed': 'Fake payment notifications refused',
  'admin-change': 'Sensitive admin changes',
  'ledger-broken': 'Activity log check failures',
};

export const buildDigest = async () => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [byType, topIps, ledger] = await Promise.all([
    SecurityEvent.aggregate([{ $match: { at: { $gte: since } } }, { $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    SecurityEvent.aggregate([
      { $match: { at: { $gte: since }, type: { $in: ['login-failed', 'login-locked'] } } },
      { $group: { _id: '$ip', count: { $sum: 1 }, accounts: { $addToSet: '$email' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    verifyLedger(),
  ]);
  return { byType, topIps, ledger };
};

const sendDigest = async () => {
  const { byType, topIps, ledger } = await buildDigest();
  if (!ledger.intact) {
    recordSecurityEvent({ type: 'ledger-broken', details: { reason: ledger.reason } });
  }
  const day = new Date().toISOString().slice(0, 10);
  await sendSecurityDigest({
    subject: `Security summary for ${day}${ledger.intact ? '' : ' (activity log check FAILED)'}`,
    title: ledger.intact ? 'Your daily security summary.' : 'Your daily security summary: the activity log check failed.',
    intro: byType.length ? 'What happened in the last 24 hours.' : 'Nothing security-related happened in the last 24 hours.',
    sections: [
      {
        title: 'Last 24 hours',
        rows: byType.map((row) => [LABELS[row._id] || row._id, String(row.count)]),
        empty: 'No security events.',
      },
      {
        title: 'Most wrong passwords from',
        rows: topIps.map((row) => [row._id || '(unknown)', `${row.count} · ${row.accounts.filter(Boolean).slice(0, 3).join(', ')}${row.accounts.length > 3 ? ' …' : ''}`]),
        empty: 'None.',
      },
      {
        title: 'Admin activity log',
        rows: [
          ['Check', ledger.intact ? 'Intact' : `FAILED: ${ledger.reason}`],
          ['Entries', String(ledger.count)],
          ['Newest entry', `#${ledger.head.seq}`],
          ['Its hash (keep this email)', ledger.head.hash],
          ['Signed entries', ledger.signing ? `Yes, since #${ledger.signedFrom ?? ledger.head.seq}` : 'No: set SECRETS_ENCRYPTION_KEY or LEDGER_HMAC_KEY'],
        ],
      },
    ],
    note: 'Keep these emails: the newest entry\'s hash is your copy of the activity log\'s state outside the database. If a later summary shows fewer entries, or the check fails, someone changed the database directly.',
  });
};

const tick = async () => {
  try {
    const now = new Date();
    if (now.getUTCHours() < DIGEST_HOUR_UTC) return;
    const day = now.toISOString().slice(0, 10);
    const { count } = await countHit(`digest:${day}`, 2 * 24 * 60 * 60 * 1000);
    if (count !== 1) return; // already sent today (by this or another container)
    await sendDigest();
  } catch (error) {
    console.error('Security summary:', error.message);
  }
};

let started = false;
// on the deployed API only (NODE_ENV=production), not on a developer's copy; SECURITY_DIGEST=on|off overrides
export const startSecurityDigest = () => {
  const wanted = process.env.SECURITY_DIGEST ? process.env.SECURITY_DIGEST === 'on' : process.env.NODE_ENV === 'production';
  if (started || !wanted) return;
  started = true;
  setTimeout(tick, 2 * 60 * 1000).unref();
  setInterval(tick, CHECK_EVERY).unref();
};
