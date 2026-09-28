import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  deleteUploadedFile,
  publicUploadUrl,
  saveUploadedBuffer,
} from "./localUploadStorage.js";

export const getStorageDriver = () => (process.env.STORAGE_DRIVER || 'local').toLowerCase();
const useLocalStorage = () => getStorageDriver() === 'local';

export const getPublicFileUrl = (key, req) => {
  if (!key) return '';
  const value = String(key);
  if (/^https?:\/\//i.test(value)) return value;

  const normalizedKey = value.replace(/^\/+/, '').replace(/^uploads\//i, '');

  if (useLocalStorage()) {
    const configuredBase = process.env.UPLOADS_PUBLIC_BASE_URL;
    if (configuredBase) {
      return `${configuredBase.replace(/\/+$/, '')}/${normalizedKey}`;
    }

    const forwardedProto = req?.headers?.['x-forwarded-proto']?.split(',')[0]?.trim();
    const forwardedHost = req?.headers?.['x-forwarded-host']?.split(',')[0]?.trim();
    const protocol = forwardedProto || req?.protocol;
    const host = forwardedHost || req?.get?.('host') || req?.headers?.host;

    if (protocol && host) {
      return `${protocol}://${host}/uploads/${normalizedKey}`;
    }

    return publicUploadUrl(normalizedKey);
  }

  const baseUrl = process.env.AWS_FILE_PATH || process.env.UPLOADS_PUBLIC_BASE_URL || '';
  if (baseUrl) {
    return `${baseUrl.replace(/\/+$/, '')}/${normalizedKey}`;
  }

  return publicUploadUrl(normalizedKey);
};

// S3 / MinIO configuration from environment variables
const getS3Config = () => {
  const config = {
    region: process.env.AWS_S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
  };

  if (process.env.AWS_S3_ENDPOINT) {
    config.endpoint = process.env.AWS_S3_ENDPOINT;
    config.forcePathStyle = true;
  }

  return config;
};

const getBucketName = () => process.env.AWS_S3_BUCKET_NAME;

const ONE_YEAR_CACHE = 'public, max-age=31536000, immutable';
const IMAGE_MAX_EDGE = Number(process.env.WEBP_MAX_EDGE || 1600);
const WEBP_QUALITY = Number(process.env.WEBP_QUALITY || 76);
const WEBP_EFFORT = Number(process.env.WEBP_EFFORT || 6);

const isConvertibleImage = (mimetype = '') => mimetype.startsWith('image/');

const cleanName = (name = 'upload') => (
  name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'upload'
);

const cleanOriginalName = (name = 'upload') => (
  name
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'upload'
);

const readUploadBody = (file, buffer) => buffer || fs.readFileSync(file.filepath);

// Uploads land flat in the store unless a folder is asked for. The folder is
// reduced to a single safe path segment — no nesting, no traversal.
const cleanFolder = (folder = '') => (
  String(folder || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
);

const withFolder = (key, folder) => {
  const segment = cleanFolder(folder);
  return segment ? `${segment}/${key}` : key;
};

const prepareUploadObject = async (file, buffer, { folder } = {}) => {
  const originalFilename = file.originalFilename || file.newFilename || 'upload';
  const fileContent = readUploadBody(file, buffer);

  if (isConvertibleImage(file.mimetype || '')) {
    const optimizedImage = await sharp(fileContent)
      .rotate()
      .resize({
        width: IMAGE_MAX_EDGE,
        height: IMAGE_MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT, smartSubsample: true })
      .toBuffer();

    return {
      body: optimizedImage,
      key: withFolder(`${Date.now()}-${cleanName(originalFilename)}.webp`, folder),
      contentType: 'image/webp',
    };
  }

  const ext = path.extname(originalFilename);
  const safeName = cleanOriginalName(originalFilename) || `upload${ext}`;

  return {
    body: fileContent,
    key: withFolder(`${Date.now()}-${safeName}`, folder),
    contentType: file.mimetype || 'application/octet-stream',
  };
};

const normalizeDeleteKey = (keyOrUrl) => {
  if (!keyOrUrl) return keyOrUrl;
  const value = String(keyOrUrl);
  const filePath = process.env.AWS_FILE_PATH || '';

  if (filePath && value.startsWith(filePath)) {
    return value.slice(filePath.length);
  }

  try {
    const parsed = new URL(value);
    return parsed.pathname.replace(/^\/+/, '').replace(/^uploads\//i, '');
  } catch (error) {
    return value.replace(/^\/uploads\//i, '');
  }
};

const uploadToLocal = async (uploadObject) => {
  await saveUploadedBuffer({
    buffer: uploadObject.body,
    key: uploadObject.key,
    contentType: uploadObject.contentType,
  });
  return uploadObject.key;
};

/**
 * Uploads a file to S3 or local disk
 * @param {Object} file - File object from Formidable
 * @param {string|null} old_file - key of a previous file to delete afterwards
 * @param {Buffer} [buffer] - the file body, when it is not on disk
 * @param {{ folder?: string }} [options] - subfolder to store under
 * @returns {Promise<string>} - Object key of the uploaded file
 */
const uploadToS3 = async (file, old_file, buffer, options = {}) => {
  try {
    const fileName = await ToStorage(file, buffer, options);
    if (old_file != null) {
      await deleteFile(`${old_file}`);
    }
    return fileName;
  } catch (error) {
    throw error;
  }
};

const putObject = async (uploadObject) => {
  if (useLocalStorage()) {
    return uploadToLocal(uploadObject);
  }

  const s3Client = new S3Client(getS3Config());

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: getBucketName(),
      Key: uploadObject.key,
      Body: uploadObject.body,
      ContentType: uploadObject.contentType,
      CacheControl: ONE_YEAR_CACHE,
    },
  });

  await upload.done();
  return uploadObject.key;
};

const ToStorage = async (file, buffer, options) => putObject(await prepareUploadObject(file, buffer, options));

export const SOCIAL_CARD_WIDTH = 1200;
export const SOCIAL_CARD_HEIGHT = 630;

/**
 * Uploads an Open Graph / Twitter card image as **JPEG**, not WebP.
 *
 * Every other upload on the site is converted to WebP, which is right for the
 * browser but wrong here: WhatsApp does not render WebP link previews at all,
 * and Facebook's handling of it is inconsistent. A social card is only ever
 * consumed by crawlers, so it is the one image that must stay JPEG.
 *
 * The image is fitted (not cropped) into 1200×630 on a white background —
 * logos are usually square with transparency, and JPEG has no alpha channel,
 * so without flattening those areas would come out black.
 */
export const uploadSocialCard = async (file, buffer) => {
  const fileContent = readUploadBody(file, buffer);

  const jpeg = await sharp(fileContent)
    .rotate()
    .resize({
      width: SOCIAL_CARD_WIDTH,
      height: SOCIAL_CARD_HEIGHT,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 82, progressive: true })
    .toBuffer();

  const name = cleanName(file.originalFilename || file.newFilename || 'social-card');
  return putObject({
    body: jpeg,
    key: `${Date.now()}-${name}-card.jpg`,
    contentType: 'image/jpeg',
  });
};

export const bufferToS3 = async (file, old_file) => {
  // The random part is not decoration. A design's four views are uploaded
  // together — `snapshotSharedDesign` fires all four at once — and the name was
  // the timestamp alone, so two of them landing in the same millisecond wrote
  // to the same key and one silently overwrote the other. That is how a shared
  // design ends up showing the same picture for two of its sides.
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-product.webp`;

  const base64Content = String(file).replace(/^data:image\/[\w.+-]+;base64,/, "");
  const buf = Buffer.from(base64Content, 'base64');
  const webpBuffer = await sharp(buf)
    .rotate()
    .resize({
      width: IMAGE_MAX_EDGE,
      height: IMAGE_MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT, smartSubsample: true })
    .toBuffer();

  if (useLocalStorage()) {
    await saveUploadedBuffer({
      buffer: webpBuffer,
      key: fileName,
      contentType: 'image/webp',
    });
  } else {
    const s3Client = new S3Client(getS3Config());
    const params = {
      Body: webpBuffer,
      Bucket: getBucketName(),
      Key: fileName,
      ContentType: 'image/webp',
      CacheControl: ONE_YEAR_CACHE,
    };
    await s3Client.send(new PutObjectCommand(params));
  }

  try {
    if (old_file != null) {
      await deleteFile(`${old_file}`);
    }
    return fileName;
  } catch (error) {
    console.error('❌ bufferToS3 error:', error);
    throw error;
  }
};

const deleteFile = async (key) => {
  const normalizedKey = normalizeDeleteKey(key);

  if (useLocalStorage()) {
    await deleteUploadedFile(normalizedKey);
    return;
  }

  const s3Client = new S3Client(getS3Config());
  const params = {
    Bucket: getBucketName(),
    Key: normalizedKey,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.error(`Error deleting old file: ${error.message}`);
  }
};

export default uploadToS3;
