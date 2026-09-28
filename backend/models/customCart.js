import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    product_qty: {
        type: Number,
        required: true,
    },
    designId: {
        type : mongoose.ObjectId,
        ref: 'design'    
    },
    userId :{
        type : mongoose.ObjectId,
        ref: 'user'
    },
    categoryId : {
         type : mongoose.ObjectId,
         required : true,
         ref: 'category'
    },
  },
  { timestamps: true }
);

export default mongoose.model("customCart", cartSchema);
