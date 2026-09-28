import mongoose from 'mongoose'

const liningSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
  });
  
  export default  mongoose.model('lining', liningSchema);
  