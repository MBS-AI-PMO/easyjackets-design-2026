import formidable from 'formidable';
import Font from '../models/font.js';
import uploadToS3 from '../helpers/fileUpload.js';

const defaultTypeYourOwnFonts = [
  { name: 'Rookie', family: 'Rookie', sourceType: 'system' },
  { name: 'Baseball', family: 'Baseball', sourceType: 'system' },
  { name: 'Ballpark', family: 'Ballpark', sourceType: 'system' },
  { name: 'Franchise', family: 'Franchise', sourceType: 'system' },
  { name: 'Geek', family: 'Geek', sourceType: 'system' },
  { name: 'Source Sans Pro', family: 'Source Sans Pro', sourceType: 'google', googleFamily: 'Source Sans Pro' },
  { name: 'Courgette', family: 'Courgette', sourceType: 'google', googleFamily: 'Courgette' },
  { name: 'Cutive', family: 'Cutive', sourceType: 'google', googleFamily: 'Cutive' },
  { name: 'Graduate', family: 'Graduate', sourceType: 'google', googleFamily: 'Graduate' },
  { name: 'Lobster Two', family: 'Lobster Two', sourceType: 'google', googleFamily: 'Lobster Two' },
  { name: 'Merienda One', family: 'Merienda One', sourceType: 'google', googleFamily: 'Merienda One' },
  { name: 'Montserrat', family: 'Montserrat', sourceType: 'google', googleFamily: 'Montserrat' },
  { name: 'Open Sans', family: 'Open Sans', sourceType: 'google', googleFamily: 'Open Sans' },
  { name: 'Oswald', family: 'Oswald', sourceType: 'google', googleFamily: 'Oswald' },
  { name: 'Pinyon Script', family: 'Pinyon Script', sourceType: 'google', googleFamily: 'Pinyon Script' },
  { name: 'Satisfy', family: 'Satisfy', sourceType: 'google', googleFamily: 'Satisfy' },
];

const allowedFontExtensions = ['.woff2', '.woff', '.ttf', '.otf', '.eot'];

const firstField = (value, fallback = '') => {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
};

const parseBoolean = (value, fallback = true) => {
  const normalized = firstField(value, fallback).toString().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const parseNumber = (value, fallback) => {
  const parsed = Number(firstField(value, fallback));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseGoogleFamily = (googleUrl, family) => {
  if (!googleUrl) return family;

  try {
    const url = new URL(googleUrl);
    const param = url.searchParams.get('family');
    if (!param) return family;
    return decodeURIComponent(param.replace(/\+/g, ' '));
  } catch {
    return family;
  }
};

const sanitizeGoogleUrl = (value, fallback = '') => {
  const raw = firstField(value, fallback);
  return `${raw ?? ''}`.trim().replace(/^['"]+|['"]+$/g, '');
};

const getUploadedFontFile = (files) => {
  const rawFile = files?.fontFile;
  return Array.isArray(rawFile) ? rawFile[0] : rawFile;
};

const ensureDefaultFonts = async () => {
  const totalFonts = await Font.countDocuments({ usage: 'typeYourOwn' });
  if (totalFonts > 0) return;

  await Font.insertMany(
    defaultTypeYourOwnFonts.map((font, index) => ({
      ...font,
      usage: 'typeYourOwn',
      builtIn: true,
      isActive: true,
      weight: '400',
      style: 'normal',
      googleFamily: font.googleFamily || '',
      order: index,
    })),
    { ordered: false }
  );
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (error, fields, files) => {
      if (error) reject(error);
      else resolve({ fields, files });
    });
  });

const buildFontPayload = async (fields, files, existingFont = null) => {
  const name = firstField(fields.name, existingFont?.name || '').trim();
  const family = firstField(fields.family, name || existingFont?.family || '').trim();
  const sourceType = firstField(fields.sourceType, existingFont?.sourceType || 'google');
  const googleUrl = sanitizeGoogleUrl(fields.googleUrl, existingFont?.googleUrl || '');
  const fontFile = getUploadedFontFile(files);

  if (!name || !family) {
    const error = new Error('Font name and family are required.');
    error.statusCode = 400;
    throw error;
  }

  if (!['system', 'google', 'file'].includes(sourceType)) {
    const error = new Error('Invalid font source type.');
    error.statusCode = 400;
    throw error;
  }

  const payload = {
    name,
    family,
    sourceType,
    googleUrl,
    googleFamily: parseGoogleFamily(googleUrl, firstField(fields.googleFamily, family).trim()),
    weight: firstField(fields.weight, existingFont?.weight || '400').trim(),
    style: firstField(fields.style, existingFont?.style || 'normal'),
    offsetX: parseNumber(fields.offsetX, existingFont?.offsetX || 0),
    offsetY: parseNumber(fields.offsetY, existingFont?.offsetY || 0),
    scale: parseNumber(fields.scale, existingFont?.scale || 1),
    isActive: parseBoolean(fields.isActive, existingFont?.isActive ?? true),
    usage: 'typeYourOwn',
  };

  if (fontFile) {
    const originalName = fontFile.originalFilename || '';
    const extension = originalName.slice(originalName.lastIndexOf('.')).toLowerCase();
    if (!allowedFontExtensions.includes(extension)) {
      const error = new Error('Only .woff2, .woff, .ttf, .otf, or .eot font files are allowed.');
      error.statusCode = 400;
      throw error;
    }

    const fileKey = await uploadToS3(fontFile, existingFont?.fileKey || null);
    payload.fileKey = fileKey;
    payload.fileUrl = `${process.env.AWS_FILE_PATH || ''}${fileKey}`;
    payload.sourceType = 'file';
  } else if (sourceType === 'file' && !existingFont?.fileUrl) {
    const error = new Error('A font file is required for file fonts.');
    error.statusCode = 400;
    throw error;
  }

  if (sourceType !== 'file' && existingFont?.fileKey) {
    payload.fileKey = existingFont.fileKey;
    payload.fileUrl = existingFont.fileUrl;
  }

  return payload;
};

export const getActiveFonts = async (req, res) => {
  try {
    await ensureDefaultFonts();
    const fonts = await Font.find({ usage: 'typeYourOwn', isActive: true }).sort({ builtIn: -1, createdAt: 1 });
    res.status(200).json({ success: true, fonts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching fonts', error: error.message });
  }
};

export const getAdminFonts = async (req, res) => {
  try {
    await ensureDefaultFonts();
    const fonts = await Font.find({ usage: 'typeYourOwn' }).sort({ builtIn: -1, createdAt: 1 });
    res.status(200).json({ success: true, fonts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching fonts', error: error.message });
  }
};

export const createFont = async (req, res) => {
  try {
    await ensureDefaultFonts();
    const { fields, files } = await parseForm(req);
    const payload = await buildFontPayload(fields, files);
    const font = await Font.create(payload);
    res.status(201).json({ success: true, message: 'Font created successfully', font });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error creating font' });
  }
};

export const updateFont = async (req, res) => {
  try {
    await ensureDefaultFonts();
    const existingFont = await Font.findById(req.params.id);
    if (!existingFont) {
      return res.status(404).json({ success: false, message: 'Font not found' });
    }

    const { fields, files } = await parseForm(req);
    const payload = await buildFontPayload(fields, files, existingFont);
    const font = await Font.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Font updated successfully', font });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error updating font' });
  }
};

export const deleteFont = async (req, res) => {
  try {
    await Font.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Font deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting font', error: error.message });
  }
};
