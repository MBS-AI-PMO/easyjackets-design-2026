// models/Color.js
import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
   materials : [{type : String}],
   parts : [{ type : String}]
});

export default mongoose.model('color', colorSchema);
