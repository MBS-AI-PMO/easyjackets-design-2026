import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import colors from "colors";
import 'dotenv/config';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import "crypto-browserify";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import paymentRoutes from './routes/paymentRoutes.js'
import { triggerWebhook } from "./controllers/paymentController.js";
import orderRoutes from './routes/orderRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import featureRoutes from './routes/featureRoutes.js'
import metadataRoute from './routes/metadataRoutes.js'
import paymentMethodRoutes from './routes/paymentMethodRoutes.js'
import galleryRoutes from './routes/galleryRoutes.js'
import patchPhotoRoutes from './routes/patchPhotoRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import customCheckoutRoutes from './routes/customCheckoutRoutes.js'
import siteTagRoutes from './routes/siteTagRoutes.js'
import fontRoutes from './routes/fontRoutes.js'
import productReviewRoutes from './routes/productReviewRoutes.js'
import fabricColorRoutes from './routes/fabricColorRoutes.js'
import emailConfigRoutes from './routes/emailConfigRoutes.js'
import shippingRateRoutes from './routes/shippingRateRoutes.js'
import sitemapRoutes from './routes/sitemapRoutes.js'
import seoHealthRoutes from './routes/seoHealthRoutes.js'
import seoRenderRoutes from './routes/seoRenderRoutes.js'
import visitorAnalyticsRoutes from './routes/visitorAnalyticsRoutes.js'
import { UPLOADS_ROOT, ensureUploadsRoot } from './helpers/localUploadStorage.js'
import { resizedImageHandler } from './helpers/imageResize.js'
import { uploadMirror } from './helpers/uploadMirror.js'
import { getStorageDriver } from './helpers/fileUpload.js'
import fs from 'fs/promises'
// const path = require("path");

// module.exports = {
//   // other webpack configurations...
//   resolve: {
//     fallback: {
//       crypto: require.resolve("crypto-browserify"),
//     },
//   },
// };

// import { connect } from "mongoose";

await connectDB();
await ensureUploadsRoot();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors())

const immutableStaticCache = {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
};

// Set up static files from frontend to serve site assets (Logo, mascots, etc.)
app.use('/assets', express.static(path.join(__dirname, 'assets'), immutableStaticCache));
// `?w=640` on an image serves a narrower copy — see helpers/imageResize.js.
// Falls through to the static file for everything else.
app.use('/uploads', uploadMirror);
app.use('/uploads', resizedImageHandler);
app.use('/uploads', express.static(UPLOADS_ROOT, immutableStaticCache));


app.post('/stripe/webhook', express.raw({ type: 'application/json' }), triggerWebhook)

app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.set('view engine', 'ejs');

// app.set('views', __dirname);


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", sitemapRoutes);
app.use("/api/v1", seoRenderRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/payment-methods", paymentMethodRoutes)
app.use("/api/v1/custom", designRoutes);
app.use('/api/v1/property', propertyRoutes)
app.use('/api/v1/order', orderRoutes)
app.use('/api/v1/features', featureRoutes)
app.use('/api/v1/metadata', metadataRoute)
app.use('/api/v1/gallery', galleryRoutes)
app.use('/api/v1/patches', patchPhotoRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/checkout', customCheckoutRoutes)
app.use('/api/v1/sitetags', siteTagRoutes)
app.use('/api/v1/fonts', fontRoutes)
app.use('/api/v1/reviews', productReviewRoutes)
app.use('/api/v1/fabric-colors', fabricColorRoutes)
app.use('/api/v1/email-config', emailConfigRoutes)
app.use('/api/v1/shipping-rates', shippingRateRoutes)
app.use('/api/v1/seo-health', seoHealthRoutes)
app.use('/api/v1/visitor-analytics', visitorAnalyticsRoutes)

// api / v1 / product / braintree / payment;

app.get("/", (req, res) => {
  res.send({
    message: "welcome to the e-commerce websites",
  });
});

app.get("/health/storage", async (req, res) => {
  try {
    const probeFile = `${UPLOADS_ROOT}/.storage-health`;
    await fs.writeFile(probeFile, 'ok');
    await fs.unlink(probeFile);

    res.json({
      ok: true,
      driver: getStorageDriver(),
      uploadsRoot: UPLOADS_ROOT,
      publicBase: process.env.UPLOADS_PUBLIC_BASE_URL || process.env.AWS_FILE_PATH || null,
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      driver: getStorageDriver(),
      uploadsRoot: UPLOADS_ROOT,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `🚀 Server is perfectly running on port ${PORT} (${process.env.DEV_MODE} mode)`.bgGreen.white
  );
  console.log(
    `📦 Product storage: ${getStorageDriver()} @ ${UPLOADS_ROOT}`.cyan
  );
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
