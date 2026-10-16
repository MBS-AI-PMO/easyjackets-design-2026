import mongoose from 'mongoose';
import SecurityEvent from '../models/securityEvent.js';
import { countHit } from './counters.js';
import { sendSecurityAlert } from './securityAlerts.js';

// Records security events for every account (models/securityEvent.js) and emails the admin about the few that
// need a person to look (helpers/securityAlerts.js). Never throws and never holds up the request: the work
// happens after the current one, and a failure is only logged to the console.
//
// Types: login-failed, login-locked, password-reset-requested, password-reset, password-changed,
// email-changed, admin-denied, session-revoked-use, rate-limited, webhook-signature-failed, admin-change (from
// the activity ledger), ledger-broken.
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ADMIN_FAILS_BEFORE_ALERT = 5;

const cut = (value, max = 200) => String(value ?? '').slice(0, max);
const SECRET = /pass|secret|token|key|otp|code|card|cvc|authorization/i;

// a small, flat copy of the details: no secrets, short text
const cleanDetails = (details) => {
  const out = {};
  if (!details || typeof details !== 'object') return out;
  for (const [key, value] of Object.entries(details).slice(0, 20)) {
    if (SECRET.test(key) && !/^(route|reason)$/i.test(key)) continue;
    if (value === null || ['number', 'boolean'].includes(typeof value)) out[cut(key, 40)] = value;
    else if (typeof value === 'string') out[cut(key, 40)] = cut(value);
    else if (value instanceof Date) out[cut(key, 40)] = value.toISOString();
  }
  return out;
};

const describeIp = (req) => cut(req?.ip || req?.socket?.remoteAddress || '', 64);

// who and from where, for an alert email
const whoLines = (event) => [
  ['Account', event.email || '(unknown)'],
  ['IP address', event.ip || '(unknown)'],
  ['Browser', event.userAgent || '(unknown)'],
  ['Time (UTC)', event.at.toISOString().replace('T', ' ').slice(0, 19)],
];

const alertFor = async (event) => {
  const lines = whoLines(event);
  switch (event.type) {
    case 'login-failed': {
      if (!event.admin) return;
      const { count } = await countHit(`alert-count:admin-fail:${event.email}`, FIFTEEN_MINUTES);
      if (count !== ADMIN_FAILS_BEFORE_ALERT) return;
      return sendSecurityAlert({
        key: `admin-fail:${event.email}`,
        subject: 'Several wrong passwords for an admin account',
        title: 'Someone is trying to sign in to an admin account.',
        intro: `${ADMIN_FAILS_BEFORE_ALERT} wrong passwords for this admin account in 15 minutes.`,
        rows: lines,
        note: 'If this was not you or another admin, change that admin\'s password.',
      });
    }
    case 'login-locked':
      if (!event.admin) return;
      return sendSecurityAlert({
        key: `admin-locked:${event.email}`,
        subject: 'An admin account was locked after too many wrong passwords',
        title: 'An admin sign-in was locked.',
        intro: 'Too many wrong passwords from this address. Sign-in from it waits 15 minutes.',
        rows: lines,
        note: 'If this was not one of your admins, change that admin\'s password.',
      });
    case 'password-reset':
    case 'password-changed':
    case 'email-changed':
      if (!event.admin) return;
      return sendSecurityAlert({
        key: `admin-account:${event.type}:${event.email}`,
        subject: 'An admin account\'s sign-in details changed',
        title: { 'password-reset': 'An admin password was reset.', 'password-changed': 'An admin password was changed.', 'email-changed': 'An admin email address was changed.' }[event.type],
        rows: [...lines, ...(event.details?.newEmail ? [['New email', event.details.newEmail]] : [])],
        note: 'If no admin did this, reset that account\'s password at once.',
      });
    case 'webhook-signature-failed':
      return sendSecurityAlert({
        key: 'webhook-signature',
        windowMs: 60 * 60 * 1000,
        subject: 'A payment notification with a bad signature was refused',
        title: 'A fake or misconfigured Stripe webhook was refused.',
        intro: 'A request to the Stripe webhook did not carry a valid Stripe signature, so it was ignored.',
        rows: [['IP address', event.ip || '(unknown)'], ['Reason', event.details?.reason || '']],
        note: 'If Stripe itself reports failed deliveries, check the webhook signing secret in Settings → Payment Configuration.',
      });
    case 'admin-change':
      return sendSecurityAlert({
        key: `admin-change:${event.details?.action}:${event.ip}`,
        windowMs: 60 * 1000,
        subject: `Admin change: ${event.details?.action || 'settings changed'}`,
        title: `${event.details?.action || 'A sensitive setting was changed'}.`,
        intro: event.details?.target ? `Item: ${event.details.target}` : undefined,
        rows: [['By', event.email || '(unknown)'], ['IP address', event.ip || '(unknown)'], ['Time (UTC)', event.at.toISOString().replace('T', ' ').slice(0, 19)]],
        note: 'This is sent for changes to admins, payments, email settings and site tags. If you do not recognise it, look at Admin → Activity Log.',
      });
    case 'ledger-broken':
      return sendSecurityAlert({
        key: 'ledger-broken',
        windowMs: 24 * 60 * 60 * 1000,
        subject: 'The admin activity log failed its integrity check',
        title: 'The activity log no longer checks out.',
        intro: event.details?.reason || 'An entry is missing, changed or unsigned.',
        rows: [['Time (UTC)', event.at.toISOString().replace('T', ' ').slice(0, 19)]],
        note: 'Someone may have changed the database directly. Compare with the last daily summary email and check who has database access.',
      });
    default:
  }
};

/**
 * Records a security event, e.g. recordSecurityEvent({ type: 'login-failed', req, user, email }).
 * `user` (a user record) fills in the email, id and whether it is an admin; `email` alone is kept as typed.
 */
export const recordSecurityEvent = ({ type, req, user, email, details } = {}) => {
  try {
    const event = {
      at: new Date(),
      type: cut(type, 40),
      email: cut((user?.email || email || '').toString().trim().toLowerCase()),
      userId: user?._id && mongoose.isValidObjectId(user._id) ? user._id : null,
      admin: user?.role === 1,
      ip: describeIp(req),
      userAgent: cut(req?.headers?.['user-agent']),
      details: cleanDetails(details),
    };
    setImmediate(() => {
      SecurityEvent.create(event).catch((error) => console.error('Security event: could not record,', error.message));
      alertFor(event).catch((error) => console.error('Security alert:', error.message));
    });
  } catch (error) {
    console.error('Security event:', error.message);
  }
};
