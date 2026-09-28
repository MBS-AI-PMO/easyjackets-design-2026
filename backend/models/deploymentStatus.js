import mongoose from 'mongoose';

const deploymentEntrySchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const deploymentStatusSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
      index: true,
    },
    message: {
      type: String,
      default: 'The site is under construction',
      trim: true,
    },
    activeDeployments: {
      type: [deploymentEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.DeploymentStatus ||
  mongoose.model('DeploymentStatus', deploymentStatusSchema);
