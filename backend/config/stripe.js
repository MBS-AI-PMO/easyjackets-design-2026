import Stripe from 'stripe';
import PaymentConfig from '../models/paymentConfigModel.js';
import { decryptSecret } from '../helpers/secretBox.js';

/**
 * The site's Stripe, from the ADMIN ONLY (Settings → Payment Configuration, stored encrypted in
 * PaymentConfig): which mode is used (LIVE or the TEST sandbox) and each mode's keys.
 *
 * There is deliberately no fallback to environment variables. With two sources, a checkout that
 * started before the admin's settings were read (e.g. just after a restart) used one Stripe
 * account and the confirmation page looked the session up in the other ("No such
 * checkout.session"). Now every call waits for the admin's settings, so the session a checkout
 * creates and the lookup that confirms it always use the same account and mode.
 *
 * `stripe` is used everywhere as before (await stripe.checkout.sessions.create(...)). Settings
 * are cached per process, re-read at least once a minute, and at once when the admin saves.
 */
const API_VERSION = '2023-10-16';
const TTL_MS = 60 * 1000;
const MODES = ['live', 'test'];
const FIELDS = ['SecretKey', 'PublishableKey', 'WebhookSecret'];

/** Where each secret is stored: the field name the encryption is bound to (helpers/secretBox.js). */
export const paymentSecretField = (mode, field) => `paymentconfigs.${mode}${field}`;

const resolve = (doc) => {
    const side = (m) => Object.fromEntries(FIELDS.map((f) => [
        f[0].toLowerCase() + f.slice(1),
        String(decryptSecret(doc?.[`${m}${f}`], paymentSecretField(m, f)) || '').trim(),
    ]));
    return {
        mode: doc?.mode === 'live' ? 'live' : 'test', // never live unless the admin chose it
        live: side('live'),
        test: side('test'),
    };
};

let settings = null; // { mode, live: { secretKey, publishableKey, webhookSecret }, test: {...} }
let loadedAt = 0;
let loading = null;

/** The admin's Stripe settings (cached for a minute; `fresh` reads them again). */
export async function getStripeSettings({ fresh = false } = {}) {
    if (!fresh && settings && Date.now() - loadedAt < TTL_MS) return settings;
    if (!loading) {
        loading = PaymentConfig.findOne({ key: 'default' })
            .select('+liveSecretKey +liveWebhookSecret +testSecretKey +testWebhookSecret')
            .lean()
            .then((doc) => { settings = resolve(doc); loadedAt = Date.now(); return settings; })
            .catch((error) => {
                // keep the last good settings through a database hiccup; with none, payments wait for the admin's
                if (settings) { console.error('Stripe settings could not be re-read, keeping the last ones:', error.message); return settings; }
                throw new Error(`The payment settings could not be read: ${error.message}`);
            })
            .finally(() => { loading = null; });
    }
    return loading;
}

export const invalidateStripeSettings = () => { loadedAt = 0; return getStripeSettings({ fresh: true }); };

const clients = new Map(); // secret key -> Stripe client
export const stripeFor = (secretKey) => {
    if (!secretKey) throw new Error('A Stripe secret key is required');
    if (!clients.has(secretKey)) clients.set(secretKey, new Stripe(secretKey, { apiVersion: API_VERSION }));
    return clients.get(secretKey);
};
// Webhook signature checks are local HMAC work with the webhook secret; no API key is involved.
const signatureOnly = new Stripe('sk_test_signature_checks_only', { apiVersion: API_VERSION });

const modeName = (m) => (m === 'live' ? 'live' : 'sandbox');

/** The client for the admin's current mode; throws a clear message when that mode has no key. */
export async function currentStripe() {
    const s = await getStripeSettings();
    const key = s[s.mode].secretKey;
    if (!key) throw new Error(`Payments are not set up: there is no ${modeName(s.mode)} Stripe secret key. Add it in the admin (Settings → Payment Configuration).`);
    return stripeFor(key);
}

/** 'live' or 'test': the mode the site is using. */
export const getStripeMode = async () => (await getStripeSettings()).mode;
/** The webhook signing secret for the current mode. */
export const getStripeWebhookSecret = async () => { const s = await getStripeSettings(); return s[s.mode].webhookSecret; };

// `stripe.a.b.c(...)`: the path is recorded, and the call runs on the current mode's client once
// the admin's settings are loaded. Every Stripe API method returns a promise, so callers already await.
const chain = (path) => new Proxy(function stripeCall() {}, {
    get: (_, prop) => (typeof prop === 'symbol' || prop === 'then' ? undefined : chain([...path, prop])),
    apply: async (_, __, args) => {
        let owner = await currentStripe();
        let target = owner;
        for (const p of path) { owner = target; target = target?.[p]; }
        if (typeof target !== 'function') throw new TypeError(`stripe.${path.join('.')} is not a function`);
        return target.apply(owner, args);
    },
});

/** The Stripe client for the admin's current mode and keys. */
export const stripe = new Proxy({}, {
    get(_, prop) {
        if (prop === 'webhooks') return signatureOnly.webhooks; // synchronous constructEvent
        if (typeof prop === 'symbol' || prop === 'then') return undefined;
        return chain([prop]);
    },
});

// read the admin's settings as soon as the database is there (mongoose queues the query)
getStripeSettings().then((s) => {
    const key = s[s.mode].secretKey;
    console.log('------------------------------------------------');
    console.log(`🔌 Stripe mode: ${s.mode === 'live' ? '🔴 LIVE' : '🔵 TEST (sandbox)'} (from the admin's Payment Configuration)`);
    console.log(key ? `🔌 Key used: ${key.slice(0, 8)}…${key.slice(-4)}` : '❌ No Stripe secret key for this mode in the admin: payments will fail until one is added.');
    console.log('------------------------------------------------');
}).catch((error) => console.error('❌ Stripe settings:', error.message));
