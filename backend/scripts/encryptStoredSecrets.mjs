// scripts/encryptStoredSecrets.mjs
//
// Brings every secret stored in the 2026 copy database (easyjackets2026) to the current encryption
// (helpers/secretBox.js: AES-256-GCM v2, a key derived from SECRETS_ENCRYPTION_KEY, each value bound
// to its field): the SMTP password and the Stripe keys / webhook secrets. Plain-text and v1 values
// are re-encrypted; v2 values are checked (they must decrypt in their own field) and left alone.
// Never prints a secret.
//
//   node scripts/encryptStoredSecrets.mjs            dry run: what would change
//   node scripts/encryptStoredSecrets.mjs --apply    encrypt / upgrade them
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { decryptSecret, encryptSecret, hasEncryptionKey, isCurrentFormat, isEncrypted } from '../helpers/secretBox.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const APPLY = process.argv.includes('--apply');
const ALLOWED_DB = 'easyjackets2026';
const FIELDS = {
  emailconfigs: ['smtpPass'],
  paymentconfigs: ['liveSecretKey', 'liveWebhookSecret', 'livePublishableKey', 'testSecretKey', 'testWebhookSecret', 'testPublishableKey'],
};

if (!hasEncryptionKey()) { console.error('SECRETS_ENCRYPTION_KEY is not set (or not 32 bytes base64): nothing can be encrypted.'); process.exit(1); }
await connectDB();
const db = mongoose.connection.db;
if (db.databaseName !== ALLOWED_DB) { console.error(`refusing: connected to "${db.databaseName}", expected "${ALLOWED_DB}"`); process.exit(1); }

let changed = 0;
let broken = 0;
for (const [collection, fields] of Object.entries(FIELDS)) {
  for await (const doc of db.collection(collection).find({})) {
    const set = {};
    for (const f of fields) {
      const v = doc[f];
      if (typeof v !== 'string' || !v) continue;
      const where = `${collection}.${f}`;
      if (isCurrentFormat(v)) {
        const ok = Boolean(decryptSecret(v, where));
        if (!ok) broken += 1;
        console.log(`  ${where}: v2${ok ? ', reads correctly' : ' but DOES NOT DECRYPT (different SECRETS_ENCRYPTION_KEY?)'}`);
        continue;
      }
      if (isEncrypted(v) && !decryptSecret(v, where)) { broken += 1; console.log(`  ${where}: v1 but does not decrypt: left alone`); continue; }
      set[f] = encryptSecret(v, where);
      changed += 1;
      console.log(`  ${where}: ${isEncrypted(v) ? 'v1' : 'plain text'}${APPLY ? ' -> v2' : ' (would become v2)'}`);
    }
    if (APPLY && Object.keys(set).length) await db.collection(collection).updateOne({ _id: doc._id }, { $set: set });
  }
}
console.log(`database ${db.databaseName}: ${changed} secret(s) ${APPLY ? 'encrypted as v2' : 'to encrypt as v2 (dry run; --apply does it)'}${broken ? `, ${broken} unreadable` : ''}`);
await mongoose.disconnect();
