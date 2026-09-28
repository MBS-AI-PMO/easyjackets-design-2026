import mongoose from 'mongoose'

const closureSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
  });
  
  export default mongoose.model('Closure', closureSchema);
  