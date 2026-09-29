// Encryption for secrets kept in the database (Stripe keys, webhook secrets, the SMTP password).
//
//   enc:v2:<base64 iv|tag|ciphertext>   (current)
//     AES-256-GCM, 96-bit random IV, 128-bit tag, with a key DERIVED for this purpose only
//     (HKDF-SHA256 from SECRETS_ENCRYPTION_KEY, so the master key itself never encrypts
//     anything) and the field the value lives in ("paymentconfigs.testSecretKey") as
//     authenticated data: a value copied into another field, or altered, does not decrypt.
//   enc:v1:...   the first format (same cipher, master key, no field binding): still read,
//     upgraded to v2 the next time it is saved or by scripts/encryptStoredSecrets.mjs --apply.
//
// Secrets are decrypted only inside the backend, when used, and never sent to a browser.
// SECRETS_ENCRYPTION_KEY (32 random bytes, base64) must be the SAME everywhere this database is
// used (this computer's backend and the server's), or one side cannot read what the other saved.
// User account passwords are not stored here: they are one-way bcrypt hashes.
import crypto from 'node:crypto';

const V1 = 'enc:v1:';
const V2 = 'enc:v2:';
const HKDF_SALT = Buffer.from('easyjackets2026:secret-box', 'utf8');
const HKDF_INFO = Buffer.from('stored-secrets:aes-256-gcm:v2', 'utf8');

const masterKey = () => {
  const raw = process.env.SECRETS_ENCRYPTION_KEY;
  if (!raw) return null;
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== 32) throw new Error('SECRETS_ENCRYPTION_KEY must be 32 bytes, base64 encoded');
  return buf;
};

let derived = null; // [master, derived key]
const v2Key = () => {
  const master = masterKey();
  if (!master) return null;
  if (!derived || !derived[0].equals(master)) derived = [master, Buffer.from(crypto.hkdfSync('sha256', master, HKDF_SALT, HKDF_INFO, 32))];
  return derived[1];
};

export const hasEncryptionKey = () => { try { return Boolean(masterKey()); } catch { return false; } };
export const isEncrypted = (value) => typeof value === 'string' && (value.startsWith(V1) || value.startsWith(V2));
/** Encrypted in the current format (v2, bound to its field). */
export const isCurrentFormat = (value) => typeof value === 'string' && value.startsWith(V2);

const openV1 = (stored) => {
  const k = masterKey();
  if (!k) throw new Error('SECRETS_ENCRYPTION_KEY is not set');
  const buf = Buffer.from(stored.slice(V1.length), 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', k, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
};

const openV2 = (stored, field) => {
  const k = v2Key();
  if (!k) throw new Error('SECRETS_ENCRYPTION_KEY is not set');
  const buf = Buffer.from(stored.slice(V2.length), 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', k, buf.subarray(0, 12), { authTagLength: 16 });
  decipher.setAAD(Buffer.from(String(field), 'utf8'));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
};

/**
 * Encrypts a secret for storage in `field` ("<collection>.<field>", e.g. "emailconfigs.smtpPass").
 * Empty stays empty; a v1 value is re-encrypted as v2. Throws when no key is configured.
 */
export const encryptSecret = (plain, field) => {
  if (plain === undefined || plain === null || plain === '') return '';
  if (!field) throw new Error('encryptSecret: the field the secret is stored in is required');
  let value = String(plain);
  if (value.startsWith(V2)) return value;
  if (value.startsWith(V1)) value = openV1(value);
  const k = v2Key();
  if (!k) throw new Error('SECRETS_ENCRYPTION_KEY is not set, so secrets cannot be saved');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', k, iv, { authTagLength: 16 });
  cipher.setAAD(Buffer.from(String(field), 'utf8'));
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return V2 + Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
};

/** The plain secret stored in `field`, for use inside the backend. '' when it cannot be read. */
export const decryptSecret = (stored, field) => {
  if (!stored) return '';
  if (!isEncrypted(stored)) {
    console.warn(`A secret is stored in plain text${field ? ` (${field})` : ''}: run scripts/encryptStoredSecrets.mjs --apply.`);
    return stored;
  }
  try {
    return stored.startsWith(V2) ? openV2(stored, field) : openV1(stored);
  } catch (error) {
    console.error(`A stored secret${field ? ` (${field})` : ''} could not be decrypted (wrong SECRETS_ENCRYPTION_KEY, or a value moved between fields):`, error.message);
    return '';
  }
};
