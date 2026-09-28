import mongoose from "mongoose";

const fabricColorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    group: {
      type: String,
      required: true,
      default: "polyester-satin",
      trim: true,
      lowercase: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    altText: {
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

fabricColorSchema.index({ group: 1, isActive: 1, sortOrder: 1, createdAt: 1 });

export default mongoose.model("FabricColor", fabricColorSchema);
