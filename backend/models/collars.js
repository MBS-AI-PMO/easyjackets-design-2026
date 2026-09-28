import mongoose from 'mongoose'

// Collar Schema with name and price
const collarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

export default mongoose.model('collar', collarSchema);
