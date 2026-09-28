import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'd:/Frontend/EasyJackets_full/node-backend/.env' });

const mongoUri = process.env.MONGO_URL;

const verifyIds = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const productId = '697863ece99769cec5ab6b4c';
        const designId = '697863ebe99769cec5ab6b4a';

        const Product = mongoose.model('Products', new mongoose.Schema({ name: String, price: Number }));
        const Design = mongoose.model('design', new mongoose.Schema({}, { strict: false }));

        const product = await Product.findById(productId);
        const design = await Design.findById(designId);

        if (design) {
            console.log('--- DESIGN KEYS ---');
            console.log('Designs Keys:', Object.keys(design.designs || {}));
            console.log('Advance Keys:', Object.keys(design.advance || {}));
            console.log('--- END DATA ---');
        } else {
            console.log('Design Not Found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

verifyIds();
