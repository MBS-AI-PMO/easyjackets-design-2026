import AnalyticsConfig from '../models/analyticsConfigModel.js';

export const getAnalyticsConfig = async (req, res) => {
    try {
        const config = await AnalyticsConfig.findOne().sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            data: config || { measurementId: '', propertyId: '' }
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error fetching config", error });
    }
};

export const getPublicAnalyticsConfig = async (req, res) => {
    try {
        const config = await AnalyticsConfig.findOne().sort({ createdAt: -1 }).select('measurementId');
        res.status(200).send({
            success: true,
            data: {
                measurementId: config?.measurementId || ''
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error fetching public config", error });
    }
};

export const saveAnalyticsConfig = async (req, res) => {
    try {
        const { measurementId, propertyId } = req.body;

        if (!measurementId || !propertyId) {
            return res.status(400).send({
                success: false,
                message: "Measurement ID and Property ID are required"
            });
        }

        const config = await AnalyticsConfig.findOneAndUpdate(
            {},
            {
                $set: { measurementId, propertyId },
                $unset: { serviceAccountJson: "" }
            },
            { upsert: true, new: true }
        );

        res.status(200).send({ success: true, message: "Configuration saved successfully", data: config });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error saving config", error });
    }
};

const dataApiDisabled = (req, res) => {
    res.status(410).send({
        success: false,
        message: "Google Analytics Data API reports are disabled in this admin panel. Use Google Analytics to view reports."
    });
};

export const getRealtimeReport = dataApiDisabled;
export const getTrafficReport = dataApiDisabled;
export const getPageViewsReport = dataApiDisabled;
export const getCountriesReport = dataApiDisabled;
