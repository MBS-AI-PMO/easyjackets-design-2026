import mongoose from "mongoose";

const partSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, unique: true },
    nick: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("part", partSchema);
