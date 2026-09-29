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
  // the 2026 quote form (storefront /bulk-order); `quantity` keeps the range's lower bound
  organization: { type: String, default: '' },
  orderType: { type: String, default: '' },     // School, Sports team, Business, Club, Event, Other
  quantityRange: { type: String, default: '' }, // e.g. "25–49"
  neededBy: { type: String, default: '' },      // yyyy-mm-dd, as entered
  budget: { type: String, default: '' },        // per jacket, e.g. "Under $100"
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
