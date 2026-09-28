import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    name: { type: String, unique: true },
    body: { type: String },
    sleeves: { type: String },
    "body-price": { type: Number },
    "sleeves-price": { type: Number },
    "mat-parent": { type: [String] }
  },
  { timestamps: true }
);

export default mongoose.model("material", materialSchema);
