import mongoose from 'mongoose';

const BulkOrderSchema = new mongoose.Schema({
  selectedProduct: {
    type: String,
    required: true
  },
  zipoutLining: {
    type: Boolean,
    default: false,
  },
  flapClosure: {
    type: Boolean,
    default: false,
  },
  selectedClosure: {
    type: String, // The currently selected closure option
  },
  selectedLining: {
    type: String, // The currently selected closure option
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Assuming you're using a separate Category model
  },
  quantity : {
     type : Number 
  },
  images: {
    type: [String], // Array of image URLs or file paths
  },
  designLocations: {
    frontCenter: { type: Boolean, default: false },
    rightChest: { type: Boolean, default: false },
    leftChest: { type: Boolean, default: false },
    rightPocket: { type: Boolean, default: false },
    leftPocket: { type: Boolean, default: false },
    rightSleeve: { type: Boolean, default: false },
    leftSleeve: { type: Boolean, default: false },
    rightCuff: { type: Boolean, default: false },
    leftCuff: { type: Boolean, default: false },
    backTop: { type: Boolean, default: false },
    backMiddle: { type: Boolean, default: false },
    backBottom: { type: Boolean, default: false },
    nickName: { type: Boolean, default: false },
  },
  name : { type : String },
  email : { type : String },
  phone : { type : String },
  country: { type : String },
  message : { type : String },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('bulkorder', BulkOrderSchema);
