import galleryModel from "../models/galleryModel.js";
import formidable from "formidable";
import uploadToS3 from "../helpers/fileUpload.js";

// Create/Upload new gallery image
export const uploadGalleryImage = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'Error parsing the files.',
            });
        }

        try {
            // Validate required fields
            const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;

            if (!description || !description.trim()) {
                return res.status(400).send({
                    success: false,
                    message: 'Description is required',
                });
            }

            const imageFiles = Array.isArray(files.image) ? files.image : (files.image ? [files.image] : []);

            // Validate image files
            if (imageFiles.length === 0) {
                return res.status(400).send({
                    success: false,
                    message: 'At least one image file is required',
                });
            }

            // Validate image type. All accepted uploads are converted and stored as WebP.
            const invalidImage = imageFiles.find((imageFile) => !String(imageFile.mimetype || '').startsWith('image/'));
            if (invalidImage) {
                return res.status(400).send({
                    success: false,
                    message: 'Only image files are allowed. Uploads are stored as optimized WebP.',
                });
            }

            // Upload to S3
            const imageUrls = [];
            for (const imageFile of imageFiles) {
                const s3Key = await uploadToS3(imageFile);
                imageUrls.push(`${process.env.AWS_FILE_PATH}${s3Key}`);
            }

            // Save to database
            const galleryImage = await galleryModel.create({
                imageUrl: imageUrls[0],
                imageUrls,
                description: description.trim(),
                isActive: true,
            });

            return res.status(201).send({
                success: true,
                message: 'Gallery image uploaded successfully',
                data: galleryImage,
            });
        } catch (error) {
            console.error('Error uploading gallery image:', error);
            return res.status(500).send({
                success: false,
                message: 'Error uploading gallery image',
                error: error.message,
            });
        }
    });
};

// Get all gallery images with pagination
export const getGalleryImages = async (req, res) => {
    try {
        const { page = 1, limit = 24 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Calculate skip value for pagination
        const skip = (pageNum - 1) * limitNum;

        // Get active gallery images sorted by creation date (newest first)
        const images = await galleryModel
            .find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const totalImages = await galleryModel.countDocuments({ isActive: true });
        const totalPages = Math.ceil(totalImages / limitNum);
        const hasMore = pageNum < totalPages;

        return res.status(200).send({
            success: true,
            data: images,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalImages,
                hasMore,
                limit: limitNum,
            },
        });
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return res.status(500).send({
            success: false,
            message: 'Error fetching gallery images',
            error: error.message,
        });
    }
};

// Get all gallery images (for admin panel)
export const getAllGalleryImages = async (req, res) => {
    try {
        // Get all gallery images (including inactive) sorted by creation date
        const images = await galleryModel
            .find({})
            .sort({ createdAt: -1 });

        return res.status(200).send({
            success: true,
            data: images,
            total: images.length,
        });
    } catch (error) {
        console.error('Error fetching all gallery images:', error);
        return res.status(500).send({
            success: false,
            message: 'Error fetching gallery images',
            error: error.message,
        });
    }
};

const normalizeBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return normalizeBoolean(value[0]);
    if (typeof value === 'string') return value === 'true';
    return value;
};

const parseJsonArrayField = (value) => {
    if (value === undefined) return undefined;
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    if (Array.isArray(normalizedValue)) return normalizedValue;

    try {
        const parsed = JSON.parse(normalizedValue || '[]');
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
        return [];
    }
};

const uploadGalleryFiles = async (files) => {
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
        const s3Key = await uploadToS3(imageFile);
        imageUrls.push(`${process.env.AWS_FILE_PATH}${s3Key}`);
    }

    return imageUrls;
};

// Update gallery item
export const updateGalleryImage = async (req, res) => {
    const updateRecord = async (id, payload, files) => {
        const updateData = {};
        const description = Array.isArray(payload.description) ? payload.description[0] : payload.description;

        if (description !== undefined) {
            if (!description.trim()) {
                const error = new Error('Description is required');
                error.statusCode = 400;
                throw error;
            }
            updateData.description = description.trim();
        }

        if (payload.isActive !== undefined) {
            updateData.isActive = normalizeBoolean(payload.isActive);
        }

        const imageUrls = await uploadGalleryFiles(files);
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
                const currentImage = await galleryModel.findById(id).select('imageUrl imageUrls');
                const currentUrls = Array.isArray(currentImage?.imageUrls) && currentImage.imageUrls.length > 0
                    ? currentImage.imageUrls
                    : [currentImage?.imageUrl].filter(Boolean);
                const nextUrls = [...currentUrls, ...imageUrls];
                updateData.imageUrl = nextUrls[0];
                updateData.imageUrls = nextUrls;
            } else {
                updateData.imageUrl = imageUrls[0];
                updateData.imageUrls = imageUrls;
            }
        }

        const updatedImage = await galleryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return updatedImage;
    };

    try {
        const { id } = req.params;
        const contentType = req.headers['content-type'] || '';

        if (contentType.includes('multipart/form-data')) {
            const form = formidable({ multiples: true });
            return form.parse(req, async (err, fields, files) => {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error parsing the files.',
                    });
                }

                try {
                    const updatedImage = await updateRecord(id, fields, files);

                    if (!updatedImage) {
                        return res.status(404).send({
                            success: false,
                            message: 'Gallery image not found',
                        });
                    }

                    return res.status(200).send({
                        success: true,
                        message: 'Gallery image updated successfully',
                        data: updatedImage,
                    });
                } catch (error) {
                    return res.status(error.statusCode || 500).send({
                        success: false,
                        message: error.message || 'Error updating gallery image',
                        error: error.message,
                    });
                }
            });
        }

        const updatedImage = await updateRecord(id, req.body || {}, {});

        if (!updatedImage) {
            return res.status(404).send({
                success: false,
                message: 'Gallery image not found',
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Gallery image updated successfully',
            data: updatedImage,
        });
    } catch (error) {
        console.error('Error updating gallery image:', error);
        return res.status(error.statusCode || 500).send({
            success: false,
            message: 'Error updating gallery image',
            error: error.message,
        });
    }
};

// Delete gallery image (soft delete)
export const deleteGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedImage = await galleryModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!deletedImage) {
            return res.status(404).send({
                success: false,
                message: 'Gallery image not found',
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Gallery image deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        return res.status(500).send({
            success: false,
            message: 'Error deleting gallery image',
            error: error.message,
        });
    }
};

// Permanently delete gallery image (hard delete)
export const permanentDeleteGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedImage = await galleryModel.findByIdAndDelete(id);

        if (!deletedImage) {
            return res.status(404).send({
                success: false,
                message: 'Gallery image not found',
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Gallery image permanently deleted',
        });
    } catch (error) {
        console.error('Error permanently deleting gallery image:', error);
        return res.status(500).send({
            success: false,
            message: 'Error deleting gallery image',
            error: error.message,
        });
    }
};
