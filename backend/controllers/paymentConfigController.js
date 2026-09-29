// Settings → Payment Configuration (admin only): Stripe keys for LIVE and the TEST sandbox,
// and which of the two the site uses. Secret keys and webhook secrets never leave the server:
// the admin sees whether one is set and its last four characters. The admin is the only source of
// Stripe keys (config/stripe.js); every key is stored encrypted (helpers/secretBox.js).
import PaymentConfig from '../models/paymentConfigModel.js';
import { getStripeSettings, invalidateStripeSettings, stripeFor } from '../config/stripe.js';
import { encryptSecret } from '../helpers/secretBox.js';

const MODES = ['live', 'test'];
const hint = (value) => (value ? `${value.slice(0, value.indexOf('_', 3) + 1 || 3)}…${value.slice(-4)}` : '');

const present = (s, doc, req) => ({
    mode: s.mode,
    modeSource: 'admin',
    webhookUrl: `${req.protocol}://${req.get('host')}/stripe/webhook`,
    ...Object.fromEntries(MODES.map((m) => [m, {
        publishableKey: s[m].publishableKey,
        publishableKeySource: 'admin',
        hasSecretKey: Boolean(s[m].secretKey),
        secretKeyHint: hint(s[m].secretKey),
        secretKeySource: 'admin',
        hasWebhookSecret: Boolean(s[m].webhookSecret),
        webhookSecretHint: hint(s[m].webhookSecret),
        webhookSecretSource: 'admin',
    }])),
    lastTest: doc?.lastTestedAt ? { at: doc.lastTestedAt, mode: doc.lastTestMode, status: doc.lastTestStatus, message: doc.lastTestMessage } : null,
});

// what each field must look like, per mode (restricted keys rk_ are accepted as secret keys)
const FORMATS = {
    live: { SecretKey: /^(sk|rk)_live_[A-Za-z0-9]{10,}$/, PublishableKey: /^pk_live_[A-Za-z0-9]{10,}$/, WebhookSecret: /^whsec_[A-Za-z0-9]{10,}$/ },
    test: { SecretKey: /^(sk|rk)_test_[A-Za-z0-9]{10,}$/, PublishableKey: /^pk_test_[A-Za-z0-9]{10,}$/, WebhookSecret: /^whsec_[A-Za-z0-9]{10,}$/ },
};
const LABELS = { SecretKey: 'secret key', PublishableKey: 'publishable key', WebhookSecret: 'webhook signing secret' };

export const getPaymentConfig = async (req, res) => {
    try {
        const s = await getStripeSettings({ fresh: true });
        const doc = await PaymentConfig.findOne({ key: 'default' }).lean();
        res.status(200).send({ success: true, config: present(s, doc, req) });
    } catch (error) {
        console.error('getPaymentConfig failed:', error);
        res.status(500).send({ success: false, message: 'Could not load payment configuration' });
    }
};

export const savePaymentConfig = async (req, res) => {
    try {
        const body = req.body || {};
        const plain = {}; // field -> new plain value ('' = cleared)
        for (const m of MODES) {
            for (const f of Object.keys(FORMATS[m])) {
                const value = body?.[m]?.[f[0].toLowerCase() + f.slice(1)];
                // blank = keep what is saved; "__clear__" empties it
                if (value === '__clear__') { plain[`${m}${f}`] = ''; continue; }
                if (typeof value !== 'string' || !value.trim()) continue;
                const v = value.trim();
                if (!FORMATS[m][f].test(v)) {
                    return res.status(400).send({ success: false, message: `The ${m === 'live' ? 'live' : 'sandbox'} ${LABELS[f]} does not look right (${m === 'live' ? 'live' : 'test'} keys start with ${f === 'WebhookSecret' ? 'whsec_' : f === 'PublishableKey' ? `pk_${m}_` : `sk_${m}_`}).` });
                }
                plain[`${m}${f}`] = v;
            }
        }
        if (body.mode !== undefined && !MODES.includes(body.mode)) return res.status(400).send({ success: false, message: 'Mode must be live or test.' });

        // never switch the site to a mode that has no secret key
        const current = await getStripeSettings({ fresh: true });
        const target = body.mode || current.mode;
        const field = `${target}SecretKey`;
        const keyAfter = field in plain ? plain[field] : current[target].secretKey;
        if (!keyAfter) {
            return res.status(400).send({ success: false, message: `There is no ${target === 'live' ? 'live' : 'sandbox'} secret key, so the site cannot use ${target === 'live' ? 'live' : 'sandbox'} payments. Add the key first.` });
        }

        // every key is stored encrypted (helpers/secretBox.js)
        let update;
        try {
            update = Object.fromEntries(Object.entries(plain).map(([k, v]) => [k, encryptSecret(v, `paymentconfigs.${k}`)]));
        } catch (error) {
            return res.status(500).send({ success: false, message: `Keys were not saved: ${error.message}.` });
        }
        if (body.mode) update.mode = body.mode;

        await PaymentConfig.findOneAndUpdate({ key: 'default' }, { $set: update }, { upsert: true, new: true, setDefaultsOnInsert: true });
        const s = await invalidateStripeSettings();
        const doc = await PaymentConfig.findOne({ key: 'default' }).lean();
        console.log(`🔌 Payment configuration saved by an admin: Stripe mode ${s.mode.toUpperCase()}`);
        res.status(200).send({ success: true, message: 'Payment configuration saved', config: present(s, doc, req) });
    } catch (error) {
        console.error('savePaymentConfig failed:', error);
        res.status(500).send({ success: false, message: 'Could not save payment configuration' });
    }
};

// Checks a secret key against Stripe (a read-only balance lookup). Uses the key typed in the
// form when given, otherwise the saved one for that mode.
export const testPaymentConfig = async (req, res) => {
    const mode = MODES.includes(req.body?.mode) ? req.body.mode : null;
    if (!mode) return res.status(400).send({ success: false, message: 'Mode must be live or test.' });
    const typed = typeof req.body?.secretKey === 'string' ? req.body.secretKey.trim() : '';
    const s = await getStripeSettings({ fresh: true });
    const key = typed || s[mode].secretKey;
    let status = 'failed';
    let message = '';
    if (!key) message = `No ${mode === 'live' ? 'live' : 'sandbox'} secret key to test.`;
    else if (!FORMATS[mode].SecretKey.test(key)) message = `That is not a ${mode === 'live' ? 'live' : 'sandbox'} secret key (it should start with sk_${mode}_).`;
    else {
        try {
            const balance = await stripeFor(key).balance.retrieve();
            if (balance.livemode !== (mode === 'live')) message = `Stripe says this key is a ${balance.livemode ? 'live' : 'test'} key.`;
            else {
                let account = '';
                try { const a = await stripeFor(key).accounts.retrieve(); account = a?.settings?.dashboard?.display_name || a?.business_profile?.name || a?.email || a?.id || ''; } catch { /* restricted keys may not read the account */ }
                status = 'success';
                message = `Stripe accepted the ${mode === 'live' ? 'live' : 'sandbox'} key${account ? ` (${account})` : ''}.`;
            }
        } catch (error) {
            message = error?.raw?.message || error.message || 'Stripe refused the key.';
        }
    }
    try {
        await PaymentConfig.findOneAndUpdate({ key: 'default' }, { $set: { lastTestedAt: new Date(), lastTestMode: mode, lastTestStatus: status, lastTestMessage: message } }, { upsert: true, setDefaultsOnInsert: true });
    } catch { /* the result is still returned */ }
    res.status(status === 'success' ? 200 : 400).send({ success: status === 'success', message });
};
