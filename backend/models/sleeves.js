import mongoose from 'mongoose'

const sleevesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
  });
  
  export default mongoose.model('sleeves', sleevesSchema);
  