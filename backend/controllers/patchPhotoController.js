// Embroidery & Patches photos — the Photo Gallery's controller with a `tags`
// field (see models/patchPhotoModel.js). Files are stored under uploads/patches.
import patchPhotoModel, { PATCH_TAGS } from "../models/patchPhotoModel.js";
import formidable from "formidable";
import uploadToS3 from "../helpers/fileUpload.js";

const FOLDER = 'patches';

const first = (value) => (Array.isArray(value) ? value[0] : value);

const normalizeBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return normalizeBoolean(value[0]);
    if (typeof value === 'string') return value === 'true';
    return value;
};

const parseJsonArrayField = (value) => {
    if (value === undefined) return undefined;
    const normalizedValue = first(value);
    if (Array.isArray(normalizedValue)) return normalizedValue;
    try {
        const parsed = JSON.parse(normalizedValue || '[]');
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
        return [];
    }
};

// Tags arrive as a JSON array, an array, or a comma-separated string; only the
// known techniques are kept, in their canonical spelling.
const parseTags = (value) => {
    if (value === undefined) return undefined;
    let list = parseJsonArrayField(value);
    if (!list || (!list.length && typeof first(value) === 'string')) list = String(first(value) || '').split(',');
    const canon = new Map(PATCH_TAGS.map((t) => [t.toLowerCase(), t]));
    return [...new Set(list.map((t) => canon.get(String(t).trim().toLowerCase())).filter(Boolean))];
};

const uploadPatchFiles = async (files) => {
    const imageFiles = Array.isArray(files?.image) ? files.image : (files?.image ? [files.image] : []);
    if (imageFiles.length === 0) return [];
    const invalidImage = imageFiles.find((imageFile) => !String(imageFile.mimetype || '').startsWith('image/'));
    if (invalidImage) {
        const error = new Error('Only image files are allowed. Uploads are stored as optimized WebP.');
        error.statusCode = 400;
        throw error;
    }
    const imageUrls = [];
    for (const imageFile of imageFiles) {
        const key = await uploadToS3(imageFile, null, undefined, { folder: FOLDER });
        imageUrls.push(`${process.env.AWS_FILE_PATH}${key}`);
    }
    return imageUrls;
};

// Create: multipart with `image` file(s), `description`, optional `tags`.
export const uploadPatchPhoto = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).send({ success: false, message: 'Error parsing the files.' });
        }
        try {
            const description = first(fields.description);
            if (!description || !description.trim()) {
                return res.status(400).send({ success: false, message: 'Description is required' });
            }
            const imageUrls = await uploadPatchFiles(files);
            if (imageUrls.length === 0) {
                return res.status(400).send({ success: false, message: 'At least one image file is required' });
            }
            const photo = await patchPhotoModel.create({
                imageUrl: imageUrls[0],
                imageUrls,
                description: description.trim(),
                tags: parseTags(fields.tags) || [],
                isActive: true,
            });
            return res.status(201).send({ success: true, message: 'Patch photo uploaded successfully', data: photo });
        } catch (error) {
            console.error('Error uploading patch photo:', error);
            return res.status(error.statusCode || 500).send({ success: false, message: error.message || 'Error uploading patch photo', error: error.message });
        }
    });
};

// Public list: active photos, newest first, with pagination like the gallery.
export const getPatchPhotos = async (req, res) => {
    try {
        const { page = 1, limit = 60, tag } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const filter = { isActive: true };
        if (tag) filter.tags = tag;
        const photos = await patchPhotoModel.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum);
        const total = await patchPhotoModel.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);
        return res.status(200).send({
            success: true,
            data: photos,
            tags: PATCH_TAGS,
            pagination: { currentPage: pageNum, totalPages, totalImages: total, hasMore: pageNum < totalPages, limit: limitNum },
        });
    } catch (error) {
        console.error('Error fetching patch photos:', error);
        return res.status(500).send({ success: false, message: 'Error fetching patch photos', error: error.message });
    }
};

// Admin list: everything, including hidden photos.
export const getAllPatchPhotos = async (req, res) => {
    try {
        const photos = await patchPhotoModel.find({}).sort({ createdAt: -1 });
        return res.status(200).send({ success: true, data: photos, total: photos.length, tags: PATCH_TAGS });
    } catch (error) {
        console.error('Error fetching all patch photos:', error);
        return res.status(500).send({ success: false, message: 'Error fetching patch photos', error: error.message });
    }
};

export const updatePatchPhoto = async (req, res) => {
    const updateRecord = async (id, payload, files) => {
        const updateData = {};
        const description = first(payload.description);
        if (description !== undefined) {
            if (!description.trim()) {
                const error = new Error('Description is required');
                error.statusCode = 400;
                throw error;
            }
            updateData.description = description.trim();
        }
        if (payload.isActive !== undefined) updateData.isActive = normalizeBoolean(payload.isActive);
        const tags = parseTags(payload.tags);
        if (tags !== undefined) updateData.tags = tags;

        const imageUrls = await uploadPatchFiles(files);
        const keepImageUrls = parseJsonArrayField(payload.keepImageUrls);
        if (keepImageUrls !== undefined) {
            const nextUrls = [...keepImageUrls, ...imageUrls];
            if (nextUrls.length === 0) {
                const error = new Error('At least one image is required');
                error.statusCode = 400;
                throw error;
            }
            updateData.imageUrl = nextUrls[0];
            updateData.imageUrls = nextUrls;
        } else if (imageUrls.length > 0) {
            if (normalizeBoolean(payload.appendImages)) {
                const current = await patchPhotoModel.findById(id).select('imageUrl imageUrls');
                const currentUrls = Array.isArray(current?.imageUrls) && current.imageUrls.length > 0 ? current.imageUrls : [current?.imageUrl].filter(Boolean);
                const nextUrls = [...currentUrls, ...imageUrls];
                updateData.imageUrl = nextUrls[0];
                updateData.imageUrls = nextUrls;
            } else {
                updateData.imageUrl = imageUrls[0];
                updateData.imageUrls = imageUrls;
            }
        }
        return patchPhotoModel.findByIdAndUpdate(id, updateData, { new: true });
    };

    const respond = (updated) => {
        if (!updated) return res.status(404).send({ success: false, message: 'Patch photo not found' });
        return res.status(200).send({ success: true, message: 'Patch photo updated successfully', data: updated });
    };

    try {
        const { id } = req.params;
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
            const form = formidable({ multiples: true });
            return form.parse(req, async (err, fields, files) => {
                if (err) return res.status(500).send({ success: false, message: 'Error parsing the files.' });
                try {
                    return respond(await updateRecord(id, fields, files));
                } catch (error) {
                    return res.status(error.statusCode || 500).send({ success: false, message: error.message || 'Error updating patch photo', error: error.message });
                }
            });
        }
        return respond(await updateRecord(id, req.body || {}, {}));
    } catch (error) {
        console.error('Error updating patch photo:', error);
        return res.status(error.statusCode || 500).send({ success: false, message: 'Error updating patch photo', error: error.message });
    }
};

// Hide (soft delete)
export const deletePatchPhoto = async (req, res) => {
    try {
        const hidden = await patchPhotoModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!hidden) return res.status(404).send({ success: false, message: 'Patch photo not found' });
        return res.status(200).send({ success: true, message: 'Patch photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting patch photo:', error);
        return res.status(500).send({ success: false, message: 'Error deleting patch photo', error: error.message });
    }
};

// Remove for good
export const permanentDeletePatchPhoto = async (req, res) => {
    try {
        const removed = await patchPhotoModel.findByIdAndDelete(req.params.id);
        if (!removed) return res.status(404).send({ success: false, message: 'Patch photo not found' });
        return res.status(200).send({ success: true, message: 'Patch photo permanently deleted' });
    } catch (error) {
        console.error('Error permanently deleting patch photo:', error);
        return res.status(500).send({ success: false, message: 'Error deleting patch photo', error: error.message });
    }
};
