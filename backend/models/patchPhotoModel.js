import mongoose from "mongoose";

// Embroidery & Patches photos: workshop shots of patches, chenille letters,
// embroidery, rhinestone and printed work, managed from the admin's
// "Embroidery & Patches" screen (a sibling of the Photo Gallery). `tags` are
// the techniques a photo shows; the storefront's filter chips key on them.
export const PATCH_TAGS = ['Patches', 'Chenille', 'Embroidery', 'Rhinestone', 'Printed', 'Names & numbers'];

const patchPhotoSchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true,
        },
        imageUrls: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("PatchPhoto", patchPhotoSchema);
