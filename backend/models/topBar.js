import mongoose from 'mongoose';

const topBarSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.TopBar || mongoose.model('TopBar', topBarSchema);
