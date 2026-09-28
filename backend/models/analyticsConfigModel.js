import mongoose from 'mongoose';

const analyticsConfigSchema = new mongoose.Schema({
    measurementId: {
        type: String,
        required: true,
    },
    propertyId: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// We only ever want one configuration document
export default mongoose.model('AnalyticsConfig', analyticsConfigSchema);
