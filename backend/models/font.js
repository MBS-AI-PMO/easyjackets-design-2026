import mongoose from 'mongoose';

const fontSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    family: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    sourceType: {
      type: String,
      enum: ['system', 'google', 'file'],
      default: 'google',
    },
    googleFamily: {
      type: String,
      trim: true,
      default: '',
    },
    googleUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fileKey: {
      type: String,
      trim: true,
      default: '',
    },
    weight: {
      type: String,
      trim: true,
      default: '400',
    },
    style: {
      type: String,
      enum: ['normal', 'italic'],
      default: 'normal',
    },
    offsetX: {
      type: Number,
      default: 0,
    },
    offsetY: {
      type: Number,
      default: 0,
    },
    scale: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    builtIn: {
      type: Boolean,
      default: false,
    },
    usage: {
      type: String,
      enum: ['typeYourOwn', 'readyToUse'],
      default: 'typeYourOwn',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Font', fontSchema);
