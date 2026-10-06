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
import siteTagRoutes from './routes/siteTagRoutes.js'
import fontRoutes from './routes/fontRoutes.js'
import productReviewRoutes from './routes/productReviewRoutes.js'
import fabricColorRoutes from './routes/fabricColorRoutes.js'
import emailConfigRoutes from './routes/emailConfigRoutes.js'
import paymentConfigRoutes from './routes/paymentConfigRoutes.js'
import shippingRateRoutes from './routes/shippingRateRoutes.js'
import sitemapRoutes from './routes/sitemapRoutes.js'
import seoHealthRoutes from './routes/seoHealthRoutes.js'
import seoRenderRoutes from './routes/seoRenderRoutes.js'
import visitorAnalyticsRoutes from './routes/visitorAnalyticsRoutes.js'
import siteStatusRoutes from './routes/siteStatusRoutes.js'
import adminLogRoutes from './routes/adminLogRoutes.js'
import { renderHoldingPage, siteUnderConstruction } from './helpers/holdingPage.js'
import { sanitizeInput } from './middlewares/sanitizeInput.js'
import { UPLOADS_ROOT, ensureUploadsRoot } from './helpers/localUploadStorage.js'
import { resizedImageHandler } from './helpers/imageResize.js'
import { uploadMirror } from './helpers/uploadMirror.js'
import { getStorageDriver } from './helpers/fileUpload.js'
import { backgroundRemovalEnabled } from './helpers/backgroundRemoval.js'
import { embeddedAllowed, startBgRemover } from './helpers/bgRemoverProcess.js'
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

// A promise that fails with nobody handling it is logged, not allowed to stop the whole API (Node's
// default is to exit the process).
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled promise rejection:', reason);
});

await connectDB();
await ensureUploadsRoot();

const app = express();
// behind Coolify's proxy: req.ip is the visitor's address (rate limits), req.protocol is https
app.set('trust proxy', 1);
app.disable('x-powered-by'); // no "X-Powered-By: Express" telling what the server runs

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The usual security headers on every answer: no type guessing, never shown inside another site's frame,
// no address leaked to other sites, and HTTPS only from now on (over HTTPS, through Coolify's proxy).
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=15552000');
  next();
});

// An error answer to a visitor who is not signed in carries no internal details: error objects (database
// and library errors, with their fields) are left out, and a server error's text becomes a plain message.
// Signed-in customers and admins get the full answer, as before.
const SERVER_ERROR_TEXT = 'Something went wrong on our side. Please try again.';
app.use((req, res, next) => {
  if (req.headers.authorization) return next();
  const json = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 400 && body && typeof body === 'object' && !Array.isArray(body)) {
      const clean = { ...body };
      for (const key of ['err', 'error', 'stack']) {
        if (clean[key] && typeof clean[key] === 'object') delete clean[key];
      }
      if (res.statusCode >= 500 && typeof clean.error === 'string') clean.error = SERVER_ERROR_TEXT;
      return json(clean);
    }
    return json(body);
  };
  next();
});

app.use(cors())

const immutableStaticCache = {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
};

// Uploads are shown as images and nothing else: the browser must not guess another type, and any file
// that is not a plain image (an uploaded .html or .svg, a PDF from the bulk-order form) is downloaded
// in a sandbox, so it can never run as a page on this site.
const SHOWN_AS_IMAGE = /\.(webp|jpe?g|png|gif|avif)$/i;
const uploadsStatic = {
  ...immutableStaticCache,
  setHeaders: (res, filePath) => {
    immutableStaticCache.setHeaders(res);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!SHOWN_AS_IMAGE.test(filePath)) {
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      res.setHeader('Content-Disposition', 'attachment');
    }
  },
};

// Set up static files from frontend to serve site assets (Logo, mascots, etc.)
app.use('/assets', express.static(path.join(__dirname, 'assets'), immutableStaticCache));
// `?w=640` on an image serves a narrower copy — see helpers/imageResize.js.
// Falls through to the static file for everything else.
app.use('/uploads', uploadMirror);
app.use('/uploads', resizedImageHandler);
app.use('/uploads', express.static(UPLOADS_ROOT, uploadsStatic));


app.post('/stripe/webhook', express.raw({ type: 'application/json' }), triggerWebhook)

// Saved designs (all their views as images) and blog posts are large; everything else is small. Bigger
// requests are refused before they are read into memory.
app.use(['/api/v1/custom', '/api/v1/features'], express.json({ limit: "50mb" }));
app.use(express.json({ limit: "10mb" }));
// no "$" keys from clients: they would be database operators (middlewares/sanitizeInput.js)
app.use(sanitizeInput);
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
// (/api/v1/checkout, card and code-confirmed cash payments, was removed: nothing used it, and it trusted the
// amount and the buyer sent by the browser, so anyone could make paid orders or charge saved cards)
app.use('/api/v1/sitetags', siteTagRoutes)
app.use('/api/v1/fonts', fontRoutes)
app.use('/api/v1/reviews', productReviewRoutes)
app.use('/api/v1/fabric-colors', fabricColorRoutes)
app.use('/api/v1/email-config', emailConfigRoutes)
app.use('/api/v1/payment-config', paymentConfigRoutes)
app.use('/api/v1/shipping-rates', shippingRateRoutes)
app.use('/api/v1/seo-health', seoHealthRoutes)
app.use('/api/v1/visitor-analytics', visitorAnalyticsRoutes)
app.use('/api/v1/site-status', siteStatusRoutes)
// the admin activity ledger, read only (Admin → Activity Log; written by helpers/adminLedger.js)
app.use('/api/v1/admin-logs', adminLogRoutes)

// The API's own address: the "under construction" page while the site is (helpers/holdingPage.js),
// else the usual greeting. Only this address; every other route keeps working.
app.get("/", async (req, res) => {
  try {
    const status = await siteUnderConstruction();
    if (status.on) {
      res.set('Cache-Control', 'no-store');
      return res.type('html').send(await renderHoldingPage(status.message));
    }
  } catch (error) {
    console.error('Holding page:', error.message);
  }
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
  // the background remover runs inside the backend: start it now so the first upload does not wait
  if (backgroundRemovalEnabled() && embeddedAllowed()) {
    startBgRemover()
      .then(() => console.log('🪄 Background remover running'.cyan))
      .catch((error) => console.error(`bg-remover: not running (${error.message}); product photos keep their backgrounds`));
  }
});

// Global Error Handler
// A request's own mistake keeps its status and message (e.g. 413 for a body too large, 400 for broken
// JSON); anything else is a 500 that says no more than that (the details are in the log).
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);
  const status = Number(err.status || err.statusCode);
  const clientError = status >= 400 && status < 500;
  res.status(clientError ? status : 500).json({
    success: false,
    message: clientError ? (err.expose === false ? 'Bad request' : err.message) : 'Internal Server Error'
  });
});
