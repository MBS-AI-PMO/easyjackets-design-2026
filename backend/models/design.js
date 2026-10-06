import mongoose from "mongoose";
const Schema = mongoose.Schema;

const designSchema = new Schema(
  {
      categoryCode: {
         type : String,
         required : true
      },
      userId : {
         type: mongoose.ObjectId,
        //  required : true,
         ref: 'user'
      },
      title: {
          type: String,
          required: true
      },
      styles: {
        type: Schema.Types.Mixed, // Object
        required: true
    },
    advance: {
        type: Schema.Types.Mixed, // Object
    },
    colors: {
        type: Schema.Types.Mixed, // Object
        required: true
    },
    materials: {
        type: Schema.Types.Mixed, // Object
        required: true
    },
    sizes: {
        type: Schema.Types.Mixed, // Object
        required: true
    },
    designs: {
        type: Schema.Types.Mixed, // Object
    },
    globals: {
        type: Schema.Types.Mixed, // Object
        required: true
    },
    jackets: {
        type: Schema.Types.Mixed, // Object
        required: true
    },
    custom_price: {
        type: Number,
    },
    custom_image: {
        type: String,
        required : true
    },
    custom_image_back: {
        type: String,
    },
    custom_image_left: {
        type: String,
    },
    custom_image_right: {
        type: String,
    },
    // a cart design's private key (controllers/designController.js): given only to the browser that added it
    // to the cart, and needed to change it; never sent back when a design is read
    editKey: {
        type: String,
        select: false,
    },
    // advanceCart: {
    //     type: String, // Storing the JSON string or object
    //     required: true
    // },
    // colorsCart: {
    //     type: String, // Storing the JSON string or object
    //     required: true
    // },
    // designsCart: {
    //     type: String, // Storing the JSON string or object
    // },
    // globalsCart: {
    //     type: String, // Storing the JSON string or object
    // },
    // jacketsCart: {
    //     type: String, // Storing the JSON string or object
    //     required: true
    // },
    // materialsCart: {
    //     type: String, // Storing the JSON string or object
    // },
    // sizesCart: {
    //     type: String, // Storing the JSON string or object
    //     required: true
    // },
    // stylesCart: {
    //     type: Schema.Types.Mixed, // Storing the JSON string or object
    // }
  },
  { timestamps: true }
);

export default mongoose.model("design", designSchema);
