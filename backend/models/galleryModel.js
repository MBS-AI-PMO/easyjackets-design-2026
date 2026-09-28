import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
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
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
