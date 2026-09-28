import mongoose from "mongoose";

const fabricSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    eyebrow: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    seedKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

fabricSectionSchema.index({ isActive: 1, sortOrder: 1, createdAt: 1 });

export default mongoose.model("FabricSection", fabricSectionSchema);
