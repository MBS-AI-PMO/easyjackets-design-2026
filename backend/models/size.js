import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    id: { "type": String, "unique": true },
      size: { "type": String },
      chest: { "type": String },
      waist: { "type": String },
      sleeves: { "type": String },
      backlength: { "type": String },
      jchest: { "type": String },
      jsleeves: { "type": String },
      jashoulder: { "type": String },
      jshoulder: { "type": String },
      jbacklength: { "type": String },
      price: { "type": String },
      fprice: { "type": String }
  },
  { timestamps: true }
);

export default mongoose.model("size", sizeSchema);
