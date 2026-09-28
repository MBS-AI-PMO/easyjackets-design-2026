import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
    banner: {
        type: [String], // Array of image URLs
        required: false, // Make it optional
    },
    review : [{
        comment : { type : String},
        author : { type : String }
    }]
}, { timestamps: true }); // Timestamps for createdAt and updatedAt

const Feature = mongoose.model('Feature', featureSchema);
export default Feature;
