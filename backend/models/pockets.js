import mongoose from 'mongoose'

const pocketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
  });
  
  export default mongoose.model('pocket', pocketSchema);
  