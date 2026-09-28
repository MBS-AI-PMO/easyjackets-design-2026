import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_ROOT = path.resolve(
  process.env.UPLOADS_DIR ||
  process.env.APP_UPLOADS_DIR ||
  (process.env.NODE_ENV === 'production'
    ? '/app/uploads'
    : path.join(__dirname, '..', 'uploads'))
);

export const PUBLIC_UPLOADS_PREFIX = '/uploads';

const normalizeKey = (key = '') => String(key)
  .replace(/\\/g, '/')
  .replace(/^\/+/, '')
  .replace(/^uploads\//i, '')
  .replace(/\.\.(\/|$)/g, '');

export const keyFromUrl = (value = '') => {
  if (!value) return '';

  try {
    const parsed = new URL(value);
    return keyFromUrl(parsed.pathname);
  } catch {
    const clean = String(value).split('?')[0].split('#')[0];
    const uploadsIndex = clean.indexOf(`${PUBLIC_UPLOADS_PREFIX}/`);
    return normalizeKey(uploadsIndex >= 0
      ? clean.slice(uploadsIndex + PUBLIC_UPLOADS_PREFIX.length + 1)
      : clean);
  }
};

export const resolveUploadPath = (key) => {
  const normalized = normalizeKey(key);
  const resolved = path.resolve(UPLOADS_ROOT, normalized);
  if (!resolved.startsWith(`${UPLOADS_ROOT}${path.sep}`) && resolved !== UPLOADS_ROOT) {
    throw new Error('Invalid upload path');
  }
  return resolved;
};

export const publicUploadUrl = (key) => {
  const encodedKey = normalizeKey(key).split('/').map(encodeURIComponent).join('/');
  const storageDriver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
  const baseUrl = process.env.UPLOADS_PUBLIC_BASE_URL || (storageDriver === 'local' ? '' : process.env.AWS_FILE_PATH || '');
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, '')}/${encodedKey}`;
  }
  return `${PUBLIC_UPLOADS_PREFIX}/${encodedKey}`;
};

export const saveUploadedBuffer = async ({ buffer, key, contentType = 'image/webp' }) => {
  const normalizedKey = normalizeKey(key);
  const filePath = resolveUploadPath(normalizedKey);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);

  return {
    key: normalizedKey,
    url: publicUploadUrl(normalizedKey),
    path: filePath,
    contentType,
  };
};

export const deleteUploadedFile = async (keyOrUrl) => {
  const key = keyFromUrl(keyOrUrl);
  if (!key) return false;

  const filePath = resolveUploadPath(key);
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};

export const ensureUploadsRoot = async () => {
  await fs.mkdir(UPLOADS_ROOT, { recursive: true });
  await fs.mkdir(path.join(UPLOADS_ROOT, 'products'), { recursive: true });
  await fs.mkdir(path.join(UPLOADS_ROOT, 'site'), { recursive: true });
};

export const randomUploadSuffix = () => `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
