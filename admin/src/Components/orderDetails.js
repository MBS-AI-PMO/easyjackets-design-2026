import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  List,
  Avatar,
  Box,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  ReceiptLong,
  LocalShipping,
  Payments,
  Inventory,
  OpenInNew,
  CalendarToday,
  Close as CloseIcon,
  Download as DownloadIcon,
  PictureAsPdf,
  ZoomIn
} from '@mui/icons-material';
import { useParams, useNavigate } from "react-router-dom";
import instance from "../constant/instance";
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { STOREFRONT_URL, uploadUrl } from '../constant/url';
// Designs saved before the move to Coolify storage still carry an
// s3.amazonaws.com URL for their preview. That bucket is gone, so those URLs
// answer 403 and every jacket shows as a blank tile. The design document keeps
// the same picture as a base64 snapshot under jackets[0], so fall back to that
// whenever the stored URL is one of the dead ones. Designs saved since, and
// plain catalogue products, are untouched by this.
// The public site these admin links open. Same value the rest of this screen
// already hard-coded; named once so it is not repeated per link.

const money = (value) => `$${(Number(value) || 0).toFixed(2)}`;

const DEAD_IMAGE_HOST = /amazonaws\.com/i;

const designSnapshot = (item) => {
  const design = item?.designId;
  if (!design || typeof design !== 'object') return null;
  const front = design.jackets?.[0]?.front;
  return typeof front === 'string' && front.startsWith('data:image/') ? front : null;
};

const usableProductImage = (item, productImage) => {
  if (productImage && !DEAD_IMAGE_HOST.test(productImage)) return productImage;
  return designSnapshot(item) || productImage;
};

// Couriers the shop ships with (Orders → Status & Shipping) and their tracking pages; the backend
// builds the same links (backend/helpers/orderShipping.js). An "Other" courier has no link: links are
// only ever built from this list, never typed in.
const CARRIER_TRACKING = {
  UPS: (n) => `https://www.ups.com/track?loc=en_US&tracknum=${encodeURIComponent(n)}`,
  DHL: (n) => `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(n)}`,
  FedEx: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
};
const STATUS_LABELS = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancel: 'Cancelled', cancelled: 'Cancelled' };
const statusLabel = (s) => STATUS_LABELS[String(s || '').toLowerCase()] || s || '';
const shippingFormFor = (order) => ({
  status: order?.status || 'pending',
  carrier: order?.shipping?.carrier || '',
  carrierName: order?.shipping?.carrierName || '',
  trackingNumber: order?.shipping?.trackingNumber || '',
  note: order?.shipping?.note || '',
  notifyCustomer: true,
});

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState({ colors: [] }); // Store fetched properties

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const getProperties = useCallback(async () => {
    try {
      const { data } = await instance.get(`/custom/get-properties`); // Fetch colors etc
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  }, []);

  const getOrderDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.get(`/order/${id}`);
      setOrderData(data?.data || {});
    } catch (err) {
      console.error("Error fetching order details:", err);
      toast.error("Error loading order details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getOrderDetails();
    getProperties();
  }, [getOrderDetails, getProperties]);

  // Status & Shipping panel: courier, tracking number and note are saved with the status; the
  // backend adds the change to the order's history and emails the customer and the owner.
  const [shipForm, setShipForm] = useState(null);
  const [savingShip, setSavingShip] = useState(false);
  useEffect(() => { setShipForm(orderData ? shippingFormFor(orderData) : null); }, [orderData]);
  const trackingPreview = shipForm && CARRIER_TRACKING[shipForm.carrier] && shipForm.trackingNumber.trim()
    ? CARRIER_TRACKING[shipForm.carrier](shipForm.trackingNumber.trim())
    : '';

  const handleShippingSave = async () => {
    if (!shipForm) return;
    if (shipForm.status === 'Shipped' && !shipForm.trackingNumber.trim()
      && !window.confirm('No tracking number entered. Mark the order as shipped anyway?')) return;
    setSavingShip(true);
    try {
      const { data } = await instance.put(`/order/${id}`, shipForm);
      if (data.success) {
        if (data.order) setOrderData((prev) => ({ ...prev, status: data.order.status, shipping: data.order.shipping, statusHistory: data.order.statusHistory }));
        toast.success(data.customerNotified ? `${data.message}. The customer has been emailed.` : data.message);
      } else {
        toast.error(data.message || 'Failed to update the order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error(err.response?.data?.message || 'Failed to update the order');
    } finally {
      setSavingShip(false);
    }
  };

  const handleDownloadImage = async (imageUrl, label) => {
    try {
      const isSvg = imageUrl.toLowerCase().endsWith('.svg') ||
        imageUrl.includes('.svg?') ||
        imageUrl.startsWith('blob:') ||
        (imageUrl.includes('s3') && !imageUrl.includes('.webp'));

      if (isSvg) {
        toast.info("Converting SVG to high-quality WebP...", { autoClose: 2000 });
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = uploadUrl(imageUrl);

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 4;
          canvas.width = (img.width || 500) * scale;
          canvas.height = (img.height || 500) * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `custom-design-${label || 'image'}.webp`);
              toast.success("Download started!");
            } else {
              toast.error("Failed to convert image.");
            }
          }, 'image/webp', 0.92);
        };

        img.onerror = () => {
          saveAs(imageUrl, `custom-design-${label || 'image'}.svg`);
        };
      } else {
        saveAs(imageUrl, `custom-design-${label || 'image'}.webp`);
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Opening in new tab instead.");
      window.open(imageUrl, '_blank');
    }
  };

  // The jacket bends Back Top / Back Bottom names over a 220-unit chord with a
  // 25.5-unit rise, which works out at a radius of 250 and a sweep of ~52
  // degrees. Matching that here is what makes the admin preview the same shape
  // as the thing being manufactured, rather than a flat approximation of it.
  const ARC_SWEEP_RAD = 52.21 * Math.PI / 180;

  // Canvas has no textPath, so an arc is drawn a glyph at a time: rotate to the
  // character's own angle, draw it on the radius, step on by its own width.
  // Each layer (border, stroke, fill) is drawn in its own pass so the outlines
  // stack the same way they do on the flat version.
  const drawArcText = (ctx, text, cx, cy, radius, paint) => {
    const chars = Array.from(text || '');
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((sum, w) => sum + w, 0);
    if (!total) return;

    // Spread the glyphs across the sweep in proportion to their widths, so the
    // spacing stays even for narrow and wide letters alike.
    let angle = -ARC_SWEEP_RAD / 2;

    chars.forEach((ch, index) => {
      const share = (widths[index] / total) * ARC_SWEEP_RAD;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + share / 2);
      ctx.translate(0, -radius);
      paint(ch, 0, 0);
      ctx.restore();
      angle += share;
    });
  };

  const generateTextPreview = (text, font, fill, stroke, border, appearance) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const fontMap = {
      'baseball': '"Baseball", sans-serif',
      'varsity': '"Franchise", sans-serif',
      'graduate': '"Graduate", serif',
      'freshman': '"Baseball", sans-serif',
      'rookie': '"Rookie", sans-serif',
      'ballpark': '"Ballpark", cursive',
      'geek': '"Geek", sans-serif',
      'script': '"Satisfy", cursive',
      'block': '"Bebas Neue", sans-serif',
      'courgette': '"Courgette", cursive',
      'cutive': '"Cutive", serif',
      'lobster': '"Lobster Two", cursive',
      'merienda': '"Merienda One", cursive',
      'montserrat': '"Montserrat", sans-serif',
      'oswald': '"Oswald", sans-serif',
      'pinyon': '"Pinyon Script", cursive',
      'satisfy': '"Satisfy", cursive'
    };

    const cleanFontName = (font || 'Arial').toLowerCase().trim();
    const mappedFont = fontMap[cleanFontName] || font || 'Arial';

    const fontSize = 100;
    ctx.font = `bold ${fontSize}px ${mappedFont}`;

    const metrics = ctx.measureText(text || '');
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;

    const padding = 30; // Increased padding for thick borders
    const isArc = String(appearance || '').toLowerCase() === 'arc';

    // Bending the text lifts its middle, so the canvas has to grow by the rise
    // of the arc or the apex is clipped off the top.
    const arcRadius = textWidth / ARC_SWEEP_RAD;
    const arcRise = arcRadius * (1 - Math.cos(ARC_SWEEP_RAD / 2));

    canvas.width = textWidth + (padding * 2);
    canvas.height = textHeight + (padding * 2) + (isArc ? arcRise : 0);

    // Resizing a canvas resets its context, so the font has to be set again.
    ctx.font = `bold ${fontSize}px ${mappedFont}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const x = canvas.width / 2;
    const y = canvas.height / 2;

    // Each layer paints the same way whether the text is flat or bent; only
    // how the glyphs are placed differs.
    const layer = (paint) => {
      if (isArc) {
        // Centre of the circle sits below the canvas, so the glyphs curve up.
        drawArcText(ctx, text || '', x, y + arcRise / 2 + arcRadius, arcRadius, paint);
      } else {
        paint(text || '', x, y);
      }
    };

    // 1. Draw Outer Border (if exists)
    if (border && border !== 'none' && border !== stroke) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      layer((t, px, py) => ctx.strokeText(t, px, py));
    }

    // 2. Draw Inner Stroke
    if (stroke && stroke !== 'none') {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = (border && border !== 'none') ? 7 : 4;
      ctx.lineJoin = 'round';
      layer((t, px, py) => ctx.strokeText(t, px, py));
    }

    // 3. Draw Fill
    if (fill && fill !== 'none') {
      ctx.fillStyle = fill;
      layer((t, px, py) => ctx.fillText(t, px, py));
    } else if ((!stroke || stroke === 'none') && (!border || border === 'none')) {
      ctx.fillStyle = '#000000';
      layer((t, px, py) => ctx.fillText(t, px, py));
    }

    return canvas.toDataURL('image/webp', 0.92);
  };

  const handleOpenModal = (url, label) => {
    setSelectedImage({ url, label });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage(null);
  };

  const isSvgString = (str) => {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    return (trimmed.startsWith('<svg') || (trimmed.startsWith('<?xml') && trimmed.includes('<svg')) || trimmed.includes('viewBox='));
  };

  const svgToDataUrl = (svgStr) => {
    try {
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("SVG conversion failed", e);
      return null;
    }
  };

  // Helper to load image as base64 with optional color filtering (e.g., for making white/grey logos)
  const loadImageAsBase64 = async (url, filterColor = null, domId = null) => {
    try {
      if (!url && !domId) return null;

      // --- STAGE 1: DOM Extraction (User Suggestion) ---
      if (domId) {
        try {
          const avatarElement = document.getElementById(domId);
          const imgElement = avatarElement?.querySelector('img');
          if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
            console.log(`[loadImageAsBase64] Attempting DOM extraction for: ${domId}`);
            const canvas = document.createElement('canvas');
            canvas.width = imgElement.naturalWidth;
            canvas.height = imgElement.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgElement, 0, 0);

            // This might still throw if tainted, but it's worth a try
            const dataUrl = canvas.toDataURL('image/png');
            console.log('[loadImageAsBase64] DOM extraction successful!');
            return { data: dataUrl, width: canvas.width, height: canvas.height };
          }
        } catch (domErr) {
          console.warn('[loadImageAsBase64] DOM Extraction failed (likely tainted), falling back to Proxy:', domErr.message);
        }
      }

      // --- STAGE 2: Backend Proxy (Definitive CORS Workaround) ---
      let resolvedUrl = url;
      if (typeof url === 'string') {
        const isS3 = url.includes('s3.amazonaws.com');
        const isExternal = url.startsWith('http') && !url.includes(window.location.hostname);

        if (isS3 || isExternal) {
          try {
            const origin = new URL(instance.defaults.baseURL).origin;
            // Target the new /api/v1/order/proxy-image endpoint
            resolvedUrl = `${origin}/api/v1/order/proxy-image?url=${encodeURIComponent(url)}`;
            console.log(`[loadImageAsBase64] Routing through proxy: ${resolvedUrl}`);
          } catch (e) {
            console.error('[loadImageAsBase64] URL parsing failed for proxy:', e);
          }
        } else if (url.startsWith('/') && !url.startsWith('//')) {
          // Root-relative paths are this app's own bundled files — the mascots
          // and flags in public/assets/images, and the site logo. They were
          // being resolved against the API origin instead, so every one of them
          // 404'd and the PDF came out with empty symbol tiles. Anything hosted
          // by the API arrives as an absolute URL and is handled above.
          resolvedUrl = `${window.location.origin}${url}`;
        }
      }

      resolvedUrl = uploadUrl(resolvedUrl); // our uploads come from the new backend
      console.log(`[loadImageAsBase64] Final Target: ${resolvedUrl}`);

      // --- STAGE 3: Loading via Image Object ---
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const timeoutId = setTimeout(() => {
          console.warn(`[loadImageAsBase64] Timeout for: ${resolvedUrl}`);
          img.src = '';
          resolve(null);
        }, 15000);

        img.onload = () => {
          clearTimeout(timeoutId);
          try {
            const canvas = document.createElement('canvas');
            const naturalW = img.naturalWidth || img.width || 100;
            const naturalH = img.naturalHeight || img.height || 100;

            // The mascot and flag files carry a viewBox and no width/height, so
            // their intrinsic size is tiny — a mascot is 39x60. Rasterised at
            // that size and then blown up to fill a PDF tile it turns to mush.
            // Drawing larger re-renders the vector at the bigger size instead.
            const MIN_LONG_EDGE = 400;
            const scale = Math.max(1, MIN_LONG_EDGE / Math.max(naturalW, naturalH));
            const w = Math.round(naturalW * scale);
            const h = Math.round(naturalH * scale);

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');

            if (filterColor) {
              ctx.drawImage(img, 0, 0, w, h);
              ctx.globalCompositeOperation = 'source-in';
              ctx.fillStyle = filterColor;
              ctx.fillRect(0, 0, w, h);
            } else {
              ctx.drawImage(img, 0, 0, w, h);
            }

            const dataUrl = canvas.toDataURL('image/png');
            resolve({ data: dataUrl, width: w, height: h });
          } catch (e) {
            console.error('[loadImageAsBase64] Stage 3 Export Error:', e);
            resolve(null);
          }
        };

        img.onerror = (err) => {
          clearTimeout(timeoutId);
          console.error(`[loadImageAsBase64] Stage 3 Load Failure: ${resolvedUrl}`, err);
          resolve(null);
        };

        if (typeof url === 'string' && (url.startsWith('<svg') || url.includes('viewBox='))) {
          const blob = new Blob([url], { type: 'image/svg+xml' });
          img.src = URL.createObjectURL(blob);
        } else {
          img.src = resolvedUrl;
        }
      });
    } catch (globalError) {
      console.error('[loadImageAsBase64] Global Error:', globalError, url);
      return null;
    }
  };

  // Helper to generate text as image with custom font and colors
  const generateTextImage = (text, fontName, fillColor, strokeColor, appearance) => {
    return new Promise((resolve) => {
      if (!text) {
        resolve(null);
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Map font names to CSS font families (sync with styles.css and custom-jacket)
        const fontMap = {
          'baseball': '"Baseball", sans-serif',
          'varsity': '"Franchise", sans-serif',
          'graduate': '"Graduate", serif',
          'freshman': '"Baseball", sans-serif',
          'rookie': '"Rookie", sans-serif',
          'ballpark': '"Ballpark", cursive',
          'geek': '"Geek", sans-serif',
          'script': '"Satisfy", cursive',
          'block': '"Bebas Neue", sans-serif',
          'courgette': '"Courgette", cursive',
          'cutive': '"Cutive", serif',
          'lobster': '"Lobster Two", cursive',
          'merienda': '"Merienda One", cursive',
          'montserrat': '"Montserrat", sans-serif',
          'oswald': '"Oswald", sans-serif',
          'pinyon': '"Pinyon Script", cursive',
        };

        const fontFamily = fontMap[fontName?.toLowerCase()] || 'Arial Black, sans-serif';
        const fontSize = text.length > 4 ? 32 : 48;

        // Set canvas size based on text
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width + 20;
        const textHeight = fontSize + 20;

        // The factory works from this PDF, so a name that is stitched on a
        // curve has to be drawn on a curve here too — the same arc the jacket
        // and the on-screen preview use.
        const isArc = String(appearance || '').toLowerCase() === 'arc';
        const arcRadius = metrics.width / ARC_SWEEP_RAD;
        const arcRise = arcRadius * (1 - Math.cos(ARC_SWEEP_RAD / 2));

        canvas.width = Math.max(textWidth, 80);
        canvas.height = Math.max(textHeight, 60) + (isArc ? arcRise : 0);

        // Clear and set font again after resize
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const x = canvas.width / 2;
        const y = canvas.height / 2;

        const layer = (paint) => {
          if (isArc) {
            drawArcText(ctx, text, x, y + arcRise / 2 + arcRadius, arcRadius, paint);
          } else {
            paint(text, x, y);
          }
        };

        // Draw stroke/outline if specified
        if (strokeColor && strokeColor !== 'none' && strokeColor.startsWith('#')) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 3;
          ctx.lineJoin = 'round';
          layer((t, px, py) => ctx.strokeText(t, px, py));
        }

        // Draw fill
        if (fillColor && fillColor !== 'none' && fillColor.startsWith('#')) {
          ctx.fillStyle = fillColor;
        } else {
          ctx.fillStyle = '#333333';
        }
        layer((t, px, py) => ctx.fillText(t, px, py));

        const dataUrl = canvas.toDataURL('image/png');
        resolve({ data: dataUrl, width: canvas.width, height: canvas.height });
      } catch (e) {
        console.error('Text to image generation failed:', e);
        resolve(null);
      }
    });
  };
  const generatePDF = async () => {
    toast.info('Generating PDF with images... Please wait');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Load Logos with Specific Color Treatments (Site Goal: White header, light grey watermark)
    const logoUrl = `/assets/images/Site-Logo.webp?v=${new Date().getTime()}`;
    const logoWhite = await loadImageAsBase64(logoUrl, '#ffffff').catch(() => null);
    const logoGrey = await loadImageAsBase64(logoUrl, '#888888').catch(() => null);

    // Helper to draw semi-transparent watermark
    const addWatermark = (pdfDoc) => {
      if (logoGrey && logoGrey.data) {
        const targetW = 150; // Larger watermark
        const aspectRatio = logoGrey.height / logoGrey.width;
        const targetH = targetW * aspectRatio;

        const centerX = (pageWidth - targetW) / 2;
        const centerY = (pageHeight - targetH) / 2;

        pdfDoc.saveGraphicsState();
        try {
          // Extremely light grey (0.05 opacity)
          pdfDoc.setGState(new pdfDoc.GState({ opacity: 0.05 }));
          pdfDoc.addImage(logoGrey.data, 'PNG', centerX, centerY, targetW, targetH, undefined, 'FAST');
        } catch (e) {
          pdfDoc.addImage(logoGrey.data, 'PNG', centerX, centerY, targetW, targetH, undefined, 'FAST');
        }
        pdfDoc.restoreGraphicsState();
      }
    };

    // Add watermark to first page
    addWatermark(doc);

    // Helper to draw color swatch
    const drawSwatch = (x, y, color, size = 4) => {
      if (color && typeof color === 'string' && color.startsWith('#') && color.length >= 7) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        // Validate parsed values are valid numbers
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          doc.setFillColor(r, g, b);
          doc.circle(x + size / 2, y + size / 2, size / 2, 'F');
          doc.setDrawColor(180, 180, 180);
          doc.circle(x + size / 2, y + size / 2, size / 2, 'S');
        }
      }
    };

    // Header with New Theme Color (#ad5d30)
    const themeRGB = [173, 93, 48]; // #ad5d30
    doc.setFillColor(...themeRGB);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Add Logo to Header (White treatment, Proportional scaling)
    if (logoWhite && logoWhite.data) {
      const targetW = 55; // Larger header logo
      const aspectRatio = logoWhite.height / logoWhite.width;
      const targetH = targetW * aspectRatio;
      doc.addImage(logoWhite.data, 'PNG', 14, (35 - targetH) / 2, targetW, targetH);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Summary', pageWidth - 14, 18, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Order #${orderData?.orderId || id.slice(-8)}`, pageWidth - 14, 25, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPos = 45;

    // Order Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...themeRGB);
    doc.text('Order Information', 14, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const orderInfo = [
      ['Status:', orderData?.status?.toUpperCase() || 'N/A'],
      ['Order Date:', new Date(orderData?.createdAt).toLocaleString()],
      ['Total Amount:', `$${orderData?.totalAmount} ${orderData?.currency?.toUpperCase() || 'USD'}`],
      ['Total Items:', orderData?.totalItems?.toString() || '0'],
      ['Payment Method:', orderData?.paymentMethod || (orderData?.isCOD ? 'COD' : 'Stripe')],
      ['Payment Status:', orderData?.paymentStatus || 'Unpaid']
    ];

    orderInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, yPos);
      yPos += 6;
    });

    yPos += 5;

    // Shipping & Billing Addresses
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...themeRGB);
    doc.text('Shipping Address', 14, yPos);
    doc.text('Billing Address', pageWidth / 2 + 5, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Shipping
    if (orderData?.shipping_details?.length) {
      const ship = orderData.shipping_details[0];
      let shipLines = [ship.name || 'N/A'];
      if (typeof ship.address === 'object') {
        if (ship.address.line1) shipLines.push(ship.address.line1);
        if (ship.address.line2) shipLines.push(ship.address.line2);
        const cityState = [ship.address.city, ship.address.state].filter(Boolean).join(', ');
        if (cityState) shipLines.push(cityState);
        const countryZip = [ship.address.country, ship.address.postal_code].filter(Boolean).join(' ');
        if (countryZip) shipLines.push(countryZip);
      } else if (ship.address) {
        shipLines.push(ship.address);
      }
      if (ship.phone) shipLines.push(`Phone: ${ship.phone}`);

      shipLines.forEach((line) => {
        doc.text(line, 14, yPos);
        yPos += 5;
      });
    } else {
      doc.text('No shipping info', 14, yPos);
      yPos += 5;
    }

    // Reset yPos for Billing (same height as shipping)
    let billingYPos = yPos - (orderData?.shipping_details?.length ? (orderData.shipping_details[0].phone ? 6 : 5) * 5 : 5);
    if (orderData?.billing_Details?.length) {
      const bill = orderData.billing_Details[0];
      let billLines = [bill.name || 'N/A'];
      if (bill.email) billLines.push(bill.email);
      if (typeof bill.address === 'object') {
        if (bill.address.line1) billLines.push(bill.address.line1);
        if (bill.address.line2) billLines.push(bill.address.line2);
        const cityState = [bill.address.city, bill.address.state].filter(Boolean).join(', ');
        if (cityState) billLines.push(cityState);
        const countryZip = [bill.address.country, bill.address.postal_code].filter(Boolean).join(' ');
        if (countryZip) billLines.push(countryZip);
      } else if (bill.address) {
        billLines.push(bill.address);
      }

      billLines.forEach((line) => {
        doc.text(line, pageWidth / 2 + 5, billingYPos);
        billingYPos += 5;
      });
    } else {
      doc.text('No billing info', pageWidth / 2 + 5, billingYPos);
    }

    yPos = Math.max(yPos, billingYPos) + 5;

    // Check for new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      addWatermark(doc);
      yPos = 20;
    }

    // Products Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Purchased Items', 14, yPos);
    yPos += 5;

    const tableData = [];
    orderData?.cartData?.forEach((item) => {
      const itemName = item.name || 'N/A';
      const qty = item.quantity || 0;
      const price = `$${item.price || 0}`;
      const subtotal = `$${(item.price * item.quantity) || 0}`;
      tableData.push([itemName, '', qty, price, subtotal]);
    });

    // Product Table with Theme Styling & Proper Alignment
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Description', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: themeRGB,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left' // Default
      },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { halign: 'right' }
      },
      // Ensure headers for Qty, Price, Total are also right-aligned
      didParseCell: function (data) {
        if (data.section === 'head' && (data.column.index >= 2)) {
          data.cell.styles.halign = 'right';
        }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // 🖼️ NEW: Product Previews Section (Robust extraction matching UI)
    const productsWithImages = (orderData?.cartData || []).map((item, idx) => {
      let productImage = null;
      if (item?.designId && typeof item.designId === 'object' && item.designId.custom_image) {
        productImage = item.designId.custom_image;
      } else if (item?.id && typeof item.id === 'object' && item.id.frontImage) {
        productImage = item.id.frontImage;
      } else if (item?.id && typeof item.id === 'object' && item.id.otherImages?.length > 0) {
        productImage = item.id.otherImages[0];
      } else if (item?.frontImage) {
        productImage = item.frontImage;
      } else if (item?._id && typeof item._id === 'object' && item._id.frontImage) {
        productImage = item._id.frontImage;
      } else if (item?.product && item.product.frontImage) {
        productImage = item.product.frontImage;
      } else if (item?.image || item?.thumbnail) {
        productImage = item.image || item.thumbnail;
      }

      productImage = usableProductImage(item, productImage);

      console.log(`[OrderDetail PDF] Item ${idx + 1} Resolved Image URL:`, String(productImage || '').slice(0, 80));
      return { ...item, productImage, originalIndex: idx };
    }).filter(item => item.productImage);

    if (productsWithImages.length > 0) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        addWatermark(doc);
        yPos = 20;
      }

      // Section Header
      doc.setFillColor(240, 245, 250);
      doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
      doc.setDrawColor(55, 166, 255);
      doc.line(14, yPos - 5, 14, yPos + 5);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 166, 255);
      doc.text('Product Previews', pageWidth / 2, yPos + 2, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      yPos += 12;

      const imgColWidth = (pageWidth - 28) / 2;
      let imgCol = 0;
      let imgRowY = yPos;
      const imgHeight = 70;

      for (const item of productsWithImages) {
        if (imgRowY + imgHeight > pageHeight - 20) {
          doc.addPage();
          addWatermark(doc);
          imgRowY = 20;
          imgCol = 0;
        }

        const x = 14 + imgCol * imgColWidth;
        const y = imgRowY;

        try {
          const domId = `product-avatar-${item.originalIndex}`;
          console.log(`[OrderDetail PDF] Attempting to load: ${item.productImage} | DOM ID: ${domId}`);
          const imgResult = await loadImageAsBase64(item.productImage, null, domId);

          if (imgResult && imgResult.data) {
            const { data, width, height } = imgResult;
            console.log(`[OrderDetail PDF] Success: ${item.productImage} (${width}x${height})`);
            const maxImgW = imgColWidth - 10;
            const maxImgH = imgHeight - 15;

            let renderW = maxImgW;
            let renderH = maxImgH;
            if (width && height) {
              const ratio = width / height;
              if (ratio > maxImgW / maxImgH) {
                renderH = maxImgW / ratio;
              } else {
                renderW = maxImgH * ratio;
              }
            }

            doc.addImage(data, 'PNG', x + (imgColWidth - renderW) / 2, y, renderW, renderH);
          } else {
            console.warn(`[OrderDetail PDF] Failed to load or CORS error: ${item.productImage}`);
          }
        } catch (imgError) {
          console.error(`[OrderDetail PDF] Error processing image: ${item.productImage}`, imgError);
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(item.name || 'Product', x + imgColWidth / 2, y + imgHeight - 5, { align: 'center' });

        imgCol++;
        if (imgCol >= 2) {
          imgCol = 0;
          imgRowY += imgHeight;
        }
      }
      yPos = imgRowY + (imgCol > 0 ? imgHeight : 0) + 15;
    }

    // Process each cart item for custom design
    for (const item of (orderData?.cartData || [])) {
      if (item.designId && typeof item.designId === 'object') {
        const design = item.designId;

        // Check for new page
        if (yPos > pageHeight - 80) {
          doc.addPage();
          addWatermark(doc);
          yPos = 20;
        }

        // Custom Design Header (Themed)
        doc.setFillColor(245, 240, 235); // Light warm background
        doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
        doc.setDrawColor(...themeRGB);
        doc.line(14, yPos - 5, 14, yPos + 5); // Accent border

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...themeRGB);
        doc.text(`Custom Design Specifications - ${item.name}`, pageWidth / 2, yPos + 2, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        // Collect specs with colors
        const colorSpecs = [];
        const textSpecs = [];

        // Helper to format value for display
        const formatValue = (value) => {
          if (!value || value === 'null' || value === 'undefined') return 'None';
          if (typeof value === 'boolean') return value ? 'Assigned' : 'None';
          if (typeof value === 'object') return 'Assigned';
          return value.toString();
        };

        // Extract Styles
        if (design.styles) {
          Object.entries(design.styles).forEach(([key, value]) => {
            if (key.toLowerCase() !== 'defaults') {
              textSpecs.push([key.charAt(0).toUpperCase() + key.slice(1), formatValue(value)]);
            }
          });
        }

        // Extract Advance options (Knit, Zipout, Piping, Inserts, etc.)
        if (design.advance) {
          Object.entries(design.advance).forEach(([key, value]) => {
            if (key.toLowerCase() !== 'defaults') {
              textSpecs.push([key.charAt(0).toUpperCase() + key.slice(1), formatValue(value)]);
            }
          });
        }

        // Extract Colors
        if (design.colors) {
          Object.entries(design.colors).forEach(([key, value]) => {
            if (key.toLowerCase() !== 'defaults') {
              if (value && typeof value === 'string' && value.startsWith('#')) {
                colorSpecs.push([`${key.charAt(0).toUpperCase() + key.slice(1)} Color`, value]);
              } else {
                colorSpecs.push([`${key.charAt(0).toUpperCase() + key.slice(1)} Color`, formatValue(value)]);
              }
            }
          });
        }

        // Extract Materials
        if (design.materials) {
          Object.entries(design.materials).forEach(([key, value]) => {
            if (key.toLowerCase() !== 'defaults') {
              textSpecs.push([`${key.charAt(0).toUpperCase() + key.slice(1)} Material`, formatValue(value)]);
            }
          });
        }

        // Extract Sizes
        if (design.sizes) {
          Object.entries(design.sizes).forEach(([key, value]) => {
            if (key.toLowerCase() !== 'defaults') {
              textSpecs.push([key.charAt(0).toUpperCase() + key.slice(1), formatValue(value)]);
            }
          });
        }

        // Draw text specs in 3 columns
        doc.setFontSize(8);
        const colWidth = (pageWidth - 28) / 3;
        let col = 0;
        let specY = yPos;

        textSpecs.forEach(([label, value]) => {
          const x = 14 + col * colWidth;
          doc.setFont('helvetica', 'bold');
          doc.text(label + ':', x, specY);
          doc.setFont('helvetica', 'normal');
          doc.text(value, x + 28, specY);

          col++;
          if (col >= 3) {
            col = 0;
            specY += 5;
          }
        });

        if (col !== 0) specY += 5;
        yPos = specY + 3;

        // Draw color specs with swatches
        if (colorSpecs.length > 0) {
          col = 0;
          for (const [label, color] of colorSpecs) {
            const x = 14 + col * colWidth;
            doc.setFont('helvetica', 'bold');
            doc.text(label + ':', x, yPos);

            // Only draw swatch for valid hex colors
            if (color && typeof color === 'string' && color.startsWith('#') && color.length >= 7) {
              drawSwatch(x + 28, yPos - 3, color, 4);
              doc.setFont('helvetica', 'normal');
              doc.text(color, x + 35, yPos);
            } else {
              doc.setFont('helvetica', 'normal');
              doc.text(color || 'None', x + 28, yPos);
            }

            col++;
            if (col >= 3) {
              col = 0;
              yPos += 6;
            }
          }
          if (col !== 0) yPos += 6;
        }

        // Patches & Decorations Section
        // Use ALL_PATCH_POSITIONS like the UI does, checking both design.designs and design.advance
        const ALL_PATCH_POSITIONS = [
          "Front Center", "Left Chest", "Right Chest",
          "Back Top", "Back Middle", "Back Bottom",
          "Left Sleeve", "Right Sleeve",
          "Left Mid Sleeve Upper", "Right Mid Sleeve Upper",
          "Left Mid Sleeve Lower", "Right Mid Sleeve Lower",
          "Left Sleeve End", "Right Sleeve End",
          "Left Pocket", "Right Pocket",
          "Hood Left", "Hood Right"
        ];

        // Check if there are any patches with content
        const hasAnyPatches = ALL_PATCH_POSITIONS.some(pos => {
          const patchData = design.designs?.[pos] || design.advance?.[pos];
          return patchData && typeof patchData === 'object';
        });

        if (hasAnyPatches) {
          yPos += 5;

          // Check for new page
          if (yPos > pageHeight - 60) {
            doc.addPage();
            addWatermark(doc);
            yPos = 20;
          }

          // Patches Header (Themed)
          doc.setFillColor(250, 245, 240);
          doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
          doc.setDrawColor(...themeRGB);
          doc.line(14, yPos - 5, 14, yPos + 5);

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...themeRGB);
          doc.text('Patches & Decorations', pageWidth / 2, yPos + 2, { align: 'center' });
          doc.setTextColor(0, 0, 0);
          yPos += 15;

          // Grid layout for patches (3 columns)
          const patchColWidth = (pageWidth - 28) / 3;
          let patchCol = 0;
          let patchRowY = yPos;
          const patchHeight = 50; // Increased height for images

          for (const position of ALL_PATCH_POSITIONS) {
            // Check BOTH design.designs and design.advance (like UI does)
            const patchData = design.designs?.[position] || design.advance?.[position];

            if (patchData && typeof patchData === 'object') {
              // ========== EXTRACT DATA MATCHING UI LOGIC ==========

              // 1. Extract main label (text) - prioritized order matching UI
              let mainLabel = '';
              const symbolType = String(patchData.symbol?.type || '');
              const symbolId = patchData.symbol?.flag || patchData.symbol?.id || '';

              // Check for mascot/flag type first
              if (symbolType) {
                const typeLower = symbolType.toLowerCase();
                if (typeLower === 'mascots' && symbolId) {
                  mainLabel = `Mascot (${symbolId})`;
                } else if (typeLower === 'flags' && symbolId) {
                  mainLabel = `Flag (${symbolId.charAt(0).toUpperCase() + symbolId.slice(1)})`;
                }
              }

              // Then prioritize text fields (FIXED: check 'title' first, then 'text')
              if (!mainLabel || mainLabel === symbolType) {
                // Check title fields first (this is where typed text is actually stored!)
                if (patchData.letters?.title) mainLabel = patchData.letters.title;
                else if (patchData.name?.title) mainLabel = patchData.name.title;
                else if (patchData.title) mainLabel = patchData.title;
                // Then check text fields as fallback
                else if (patchData.text) mainLabel = patchData.text;
                else if (patchData.custom_text) mainLabel = patchData.custom_text;
                else if (patchData.symbol?.text) mainLabel = patchData.symbol.text;
                else if (patchData.letters?.text) mainLabel = patchData.letters.text;
                else if (patchData.name?.text) mainLabel = patchData.name.text;
                else if (patchData.upload?.file || patchData.custom_image || patchData.image) {
                  mainLabel = 'Custom Upload';
                } else if (patchData.done) {
                  mainLabel = 'Assigned';
                }
              }

              // 2. Extract font
              const font = patchData.font || patchData.letters?.font || patchData.name?.font ||
                patchData.symbol?.font || patchData.fontFamily || design.font || '';

              // Apply uppercase for specific fonts (like UI)
              const uppercaseFonts = ['rookie', 'baseball', 'graduate', 'freshman', 'varsity'];
              if (mainLabel && font && uppercaseFonts.some(f => font.toLowerCase().includes(f))) {
                const isSystemLabel = ['assigned', 'custom upload', 'mascot', 'flag'].some(l => mainLabel.toLowerCase().startsWith(l));
                if (!isSystemLabel) {
                  mainLabel = mainLabel.toUpperCase();
                }
              }

              // 3. Extract colors (check all possible locations like UI)
              const fill = patchData.fill || patchData.letters?.fill || patchData.name?.fill ||
                patchData.symbol?.fill || patchData.color || design.fill || '';
              const stroke = patchData.stroke || patchData.letters?.stroke || patchData.name?.stroke ||
                patchData.symbol?.stroke || patchData.symbol?.strokeColor || design.stroke || '';
              const border = patchData.border || patchData.letters?.border || patchData.name?.border ||
                patchData.symbol?.border || patchData.symbol?.borderColor || design.border || '';

              // 4. Determine image URL with color injection for SVG
              let imageUrl = null;
              const svgPath = patchData.path || patchData.letters?.path || patchData.name?.path;

              // CRITICAL: Detect Type Your Own mode to skip stale SVG paths (matching UI logic)
              const designMode = patchData.type || patchData.letters?.type || patchData.name?.type ||
                (font ? "Type Your Own" : "Ready To Use");
              const isTypeMode = designMode === "Type Your Own";

              // Helper to check if label is system-generated (shouldn't skip SVG for these)
              const isSystemLabel = (lbl) => {
                if (!lbl) return true;
                const lower = lbl.toLowerCase();
                return lower === 'assigned' || lower === 'custom upload' ||
                  lower === 'custom design' || lower.startsWith('mascot') || lower.startsWith('flag');
              };

              // ONLY use SVG path if NOT in Type Mode, or if mainLabel is a system label
              // This prevents stale SVG paths (from old selections) from overriding typed text
              if (svgPath && isSvgString(svgPath) && (!isTypeMode || isSystemLabel(mainLabel))) {
                // Inject colors into SVG (matching UI logic)
                let coloredSvg = svgPath;

                // Inject fills
                const fillMatches = coloredSvg.match(/fill=["'][^"']*["']/g) || [];
                if (fillMatches.length > 0 && fill) {
                  let fIndex = 0;
                  coloredSvg = coloredSvg.replace(/fill=["'][^"']*["']/g, () => {
                    fIndex++;
                    if (fillMatches.length === 3) {
                      if (fIndex === 1 && border) return `fill="${border}"`;
                      if (fIndex === 2 && (stroke || border)) return `fill="${stroke || border}"`;
                      return `fill="${fill}"`;
                    }
                    if (fillMatches.length === 2) {
                      if (fIndex === 1 && (border || stroke)) return `fill="${border || stroke}"`;
                      return `fill="${fill}"`;
                    }
                    return `fill="${fill}"`;
                  });
                }

                // Inject strokes
                const strokeMatches = coloredSvg.match(/stroke=["'][^"']*["']/g) || [];
                if (strokeMatches.length > 0 && (stroke || border)) {
                  let sIndex = 0;
                  coloredSvg = coloredSvg.replace(/stroke=["'][^"']*["']/g, () => {
                    sIndex++;
                    if (strokeMatches.length >= 2) {
                      if (sIndex === 1 && border) return `stroke="${border}"`;
                      return `stroke="${stroke || border}"`;
                    }
                    return `stroke="${stroke || border}"`;
                  });
                }

                imageUrl = coloredSvg;
                if (!mainLabel || mainLabel === 'Assigned') mainLabel = 'Custom Design';
              }
              // Check for mascot/flag images
              else if (symbolType?.toLowerCase() === 'mascots' && symbolId) {
                imageUrl = `/assets/images/mascots/${symbolId}.svg`;
              }
              else if (symbolType?.toLowerCase() === 'flags' && symbolId) {
                imageUrl = `/assets/images/flags/${symbolId}.svg`;
              }
              // Check for custom uploads
              else if (patchData.upload?.file) {
                imageUrl = patchData.upload.file;
              }
              else if (patchData.custom_image) {
                imageUrl = patchData.custom_image;
              }
              else if (patchData.image) {
                imageUrl = patchData.image;
              }

              // FALLBACK: For Type Your Own patches without SVG, generate text image
              // This renders the typed text with the selected font and colors
              if (!imageUrl && mainLabel && isTypeMode && !isSystemLabel(mainLabel)) {
                // Will generate text image with font and colors
                const patchAppearance = patchData.appearance
                  || patchData.name?.appearance
                  || patchData.letters?.appearance
                  || 'Straight';
                const textImage = await generateTextImage(mainLabel, font, fill, stroke, patchAppearance);
                if (textImage) {
                  imageUrl = textImage;
                }
              }

              // Skip if no content
              const hasContent = mainLabel || imageUrl || fill || stroke || border || font || patchData.done;
              if (!hasContent) continue;

              // ========== RENDER PATCH BOX ==========

              // Check for new page
              if (patchRowY + patchHeight > pageHeight - 20) {
                doc.addPage();
                addWatermark(doc);
                patchRowY = 20;
                patchCol = 0;
              }

              const x = 14 + patchCol * patchColWidth;
              const y = patchRowY;

              // Draw patch box
              doc.setDrawColor(200, 200, 200);
              doc.setFillColor(250, 250, 250);
              doc.roundedRect(x, y, patchColWidth - 5, patchHeight - 2, 2, 2, 'FD');

              // Position title
              doc.setFontSize(8);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(55, 166, 255);
              doc.text(position + ':', x + 2, y + 5);
              doc.setTextColor(0, 0, 0);

              // Main label (text content)
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9);
              let contentY = y + 12;
              if (mainLabel && mainLabel !== 'Assigned' && mainLabel !== 'Custom Design') {
                doc.text(mainLabel.length > 16 ? mainLabel.substring(0, 16) + '...' : mainLabel, x + 2, contentY);
                contentY += 5;
              } else if (mainLabel === 'Custom Design' || mainLabel === 'Custom Upload') {
                doc.text(mainLabel, x + 2, contentY);
                contentY += 5;
              }

              // Helper to check for valid hex colors
              const isValidHex = (c) => c && typeof c === 'string' && c.startsWith('#') && c.length >= 7;

              // Try to load and embed image
              let renderWidth = 0;
              let renderHeight = 0;
              const maxWidth = 20;
              const maxHeight = 20;

              if (imageUrl) {
                try {
                  // If imageUrl is already the object from generateTextImage, use it directly
                  // Otherwise load it via loadImageAsBase64
                  let result = null;
                  if (typeof imageUrl === 'object' && imageUrl.data) {
                    result = imageUrl;
                  } else {
                    result = await loadImageAsBase64(imageUrl);
                  }

                  if (result && result.data) {
                    const { data, width, height } = result;

                    // PROPORTIONAL SCALING: Maintain aspect ratio
                    renderWidth = maxWidth;
                    renderHeight = maxHeight;

                    if (width && height) {
                      const ratio = width / height;
                      if (ratio > 1) {
                        // Wide image - Fit to width
                        renderHeight = maxWidth / ratio;
                      } else {
                        // Tall image - Fit to height
                        renderWidth = maxHeight * ratio;
                      }
                    }

                    // NEUTRAL BACKGROUND & BORDER
                    doc.setFillColor(255, 255, 255);
                    doc.setDrawColor(230, 230, 230);
                    doc.setLineWidth(0.1);
                    doc.rect(x + 2, contentY, renderWidth, renderHeight, 'FD');

                    doc.addImage(data, 'PNG', x + 2 + (renderWidth * 0.05), contentY + (renderHeight * 0.05), renderWidth * 0.9, renderHeight * 0.9);
                    contentY += renderHeight + 2;
                  }
                } catch (e) {
                  console.error('Failed to add image to PDF:', e);
                }
              }

              // Font (show beside image if there's one, but move down if label is long)
              if (font) {
                const isLongLabel = mainLabel && mainLabel.length > 8;
                const fontX = (imageUrl && renderWidth > 0 && !isLongLabel) ? x + renderWidth + 5 : x + 2;
                const fontY = (isLongLabel || !imageUrl) ? contentY : y + 12;

                doc.setFontSize(7);
                doc.setFont('helvetica', 'italic');
                doc.text(`Font: ${font}`, fontX, fontY);
                if (isLongLabel || !imageUrl) contentY += 4;
              }

              // Color swatches row (at bottom of box)
              let swatchY = y + patchHeight - 10;
              let swatchX = x + 2;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(6);

              const isValidHexInternal = (c) => c && typeof c === 'string' && c.startsWith('#') && c.length >= 7;

              if (fill && fill !== 'none' && isValidHexInternal(fill)) {
                drawSwatch(swatchX, swatchY, fill, 4);
                doc.text('Fill', swatchX + 5, swatchY + 3);
                swatchX += 18;
              }
              if (stroke && stroke !== 'none' && isValidHex(stroke)) {
                drawSwatch(swatchX, swatchY, stroke, 4);
                doc.text('Stroke', swatchX + 5, swatchY + 3);
                swatchX += 22;
              }
              if (border && border !== 'none' && isValidHex(border)) {
                drawSwatch(swatchX, swatchY, border, 4);
                doc.text('Border', swatchX + 5, swatchY + 3);
              }

              patchCol++;
              if (patchCol >= 3) {
                patchCol = 0;
                patchRowY += patchHeight;
              }
            }
          }

          yPos = patchRowY + (patchCol > 0 ? patchHeight : 0) + 10;
        }
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }

    // Save PDF
    const filename = `Order-${orderData?.orderId || id.slice(-8)}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    toast.success('PDF downloaded successfully!');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#37a6ff' }} />
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'shipped': return '#2196f3';
      case 'delivered': return '#4caf50';
      case 'cancel':
      case 'cancelled': return '#f44336';
      case 'processing': return '#ff9800';
      default: return '#37a6ff';
    }
  };

  // Shipping is never stored as its own field — the order keeps one
  // `totalAmount` and the cart lines. So the carriage is whatever the total
  // carries beyond the lines, which is why a single $70 jacket could sit under
  // an $80 total with nothing on screen to explain the difference.
  const orderItems = Array.isArray(orderData?.cartData) ? orderData.cartData : [];
  const itemsSubtotal = orderItems.reduce(
    (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1),
    0,
  );
  const shippingRemainder = Number((Number(orderData?.totalAmount || 0) - itemsSubtotal).toFixed(2));
  const shippingCharged = Math.max(0, shippingRemainder);

  const sectionTitle = (icon, title) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {React.cloneElement(icon, { sx: { color: '#37a6ff' } })}
      <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>

      {/* Header Card - Light Blue Theme */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(55, 166, 255, 0.2)',
        }}
      >
        <CardContent sx={{ py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold">Order Summary</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Details for Order #{orderData?.orderId || id.slice(-8)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={generatePDF}
              sx={{
                bgcolor: '#d32f2f',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                '&:hover': { bgcolor: '#c62828' },
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
              }}
            >
              Download PDF
            </Button>
            <ReceiptLong sx={{ fontSize: 48, opacity: 0.5 }} />
          </Box>
        </CardContent>
      </Card>

      {orderData && (
        <Grid container spacing={3}>
          {/* General Info */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ bgcolor: '#ffffff', borderRadius: 3, height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                {sectionTitle(<ReceiptLong />, "Basic Information")}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#888' }}>Order Status</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={orderData?.status?.toUpperCase()}
                        sx={{
                          bgcolor: `${getStatusColor(orderData.status)}15`,
                          color: getStatusColor(orderData.status),
                          fontWeight: 'bold',
                          border: `1px solid ${getStatusColor(orderData.status)}30`
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#666' }}>Items subtotal</Typography>
                    <Typography sx={{ color: '#333', fontWeight: 600 }}>{money(itemsSubtotal)}</Typography>
                  </Box>
                  {shippingCharged > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#666' }}>Shipping</Typography>
                      <Typography sx={{ color: '#333', fontWeight: 600 }}>{money(shippingCharged)}</Typography>
                    </Box>
                  )}
                  {/* A mismatch the other way means the lines add up to more
                      than was charged — a discount, or figures that have drifted.
                      Either way it is worth showing rather than hiding. */}
                  {shippingRemainder < 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#666' }}>Discount</Typography>
                      <Typography sx={{ color: '#2e7d32', fontWeight: 600 }}>-{money(Math.abs(shippingRemainder))}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e8eaed', borderBottom: '1px solid #f0f0f0', pt: 1.5, pb: 1 }}>
                    <Typography sx={{ color: '#333', fontWeight: 'bold' }}>Total Amount</Typography>
                    <Typography sx={{ color: '#37a6ff', fontWeight: 'bold' }}>
                      ${orderData.totalAmount} {orderData.currency?.toUpperCase()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                    <Typography sx={{ color: '#666' }}>Total Items</Typography>
                    <Typography sx={{ color: '#333', fontWeight: 600 }}>{orderData.totalItems}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: '#999' }} />
                    <Typography sx={{ color: '#888', fontSize: '0.875rem' }}>
                      Ordered: {new Date(orderData.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Shipping & Billing */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 3 }}>
                    {sectionTitle(<LocalShipping />, "Shipping Address")}
                    {orderData?.shipping_details?.length ? (
                      <Box>
                        <Typography sx={{ color: '#333', fontWeight: 'bold', mb: 1 }}>
                          {orderData.shipping_details[0]?.name}
                        </Typography>
                        <Box sx={{ color: '#666', lineHeight: 1.6, fontSize: '0.875rem' }}>
                          {typeof orderData.shipping_details[0]?.address === 'object' ? (
                            <>
                              {orderData.shipping_details[0].address.line1 && <>{orderData.shipping_details[0].address.line1}<br /></>}
                              {orderData.shipping_details[0].address.line2 && <>{orderData.shipping_details[0].address.line2}<br /></>}
                              {(orderData.shipping_details[0].address.city || orderData.shipping_details[0].address.state) && (
                                <>{[orderData.shipping_details[0].address.city, orderData.shipping_details[0].address.state].filter(Boolean).join(', ')}<br /></>
                              )}
                              {[orderData.shipping_details[0].address.country, orderData.shipping_details[0].address.postal_code].filter(Boolean).join(' - ')}
                            </>
                          ) : (
                            <Typography variant="body2">{orderData.shipping_details[0]?.address || 'N/A'}</Typography>
                          )}
                          <Typography component="span" sx={{ color: '#37a6ff', mt: 1, display: 'block', fontWeight: 600 }}>
                            Phone: {orderData.shipping_details[0]?.phone || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                          <Typography variant="caption" sx={{ color: '#888', mb: 1.5, display: 'block' }}>
                            Status & Shipping
                          </Typography>
                          {shipForm && (
                            <Stack spacing={1.5}>
                              <FormControl fullWidth size="small">
                                <InputLabel id="ship-status-label">Order status</InputLabel>
                                <Select
                                  labelId="ship-status-label"
                                  label="Order status"
                                  value={shipForm.status}
                                  onChange={(e) => setShipForm({ ...shipForm, status: e.target.value })}
                                  sx={{ borderRadius: 2, '& .MuiSelect-select': { fontWeight: 'bold', color: getStatusColor(shipForm.status) } }}
                                >
                                  <MenuItem value="pending" sx={{ fontWeight: 'bold', color: getStatusColor('pending') }}>Pending</MenuItem>
                                  <MenuItem value="Processing" sx={{ fontWeight: 'bold', color: getStatusColor('processing') }}>Processing</MenuItem>
                                  <MenuItem value="Shipped" sx={{ fontWeight: 'bold', color: getStatusColor('shipped') }}>Shipped</MenuItem>
                                  <MenuItem value="delivered" sx={{ fontWeight: 'bold', color: getStatusColor('delivered') }}>Delivered</MenuItem>
                                  <MenuItem value="cancel" sx={{ fontWeight: 'bold', color: getStatusColor('cancel') }}>Cancelled</MenuItem>
                                </Select>
                              </FormControl>
                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                                <FormControl fullWidth size="small">
                                  <InputLabel id="ship-carrier-label">Courier</InputLabel>
                                  <Select
                                    labelId="ship-carrier-label"
                                    label="Courier"
                                    value={shipForm.carrier}
                                    onChange={(e) => setShipForm({ ...shipForm, carrier: e.target.value })}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <MenuItem value=""><em>Not shipped yet</em></MenuItem>
                                    <MenuItem value="UPS">UPS</MenuItem>
                                    <MenuItem value="DHL">DHL</MenuItem>
                                    <MenuItem value="FedEx">FedEx</MenuItem>
                                    <MenuItem value="Other">Other courier</MenuItem>
                                  </Select>
                                </FormControl>
                                <TextField
                                  size="small"
                                  label="Tracking number"
                                  value={shipForm.trackingNumber}
                                  onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })}
                                  inputProps={{ maxLength: 80 }}
                                />
                              </Box>
                              {shipForm.carrier === 'Other' && (
                                <TextField
                                  size="small"
                                  label="Courier name"
                                  value={shipForm.carrierName}
                                  onChange={(e) => setShipForm({ ...shipForm, carrierName: e.target.value })}
                                  inputProps={{ maxLength: 60 }}
                                  helperText="The customer sees the courier's name and the tracking number (no tracking link for other couriers)."
                                />
                              )}
                              <TextField
                                size="small"
                                label="Note to the customer (optional)"
                                placeholder="e.g. Left with the courier today, expected in 4–5 business days"
                                value={shipForm.note}
                                onChange={(e) => setShipForm({ ...shipForm, note: e.target.value })}
                                multiline
                                minRows={2}
                                inputProps={{ maxLength: 300 }}
                              />
                              {trackingPreview && (
                                <Typography variant="caption">
                                  Tracking link: <a href={trackingPreview} target="_blank" rel="noreferrer" style={{ color: '#37a6ff', wordBreak: 'break-all' }}>{trackingPreview}</a>
                                </Typography>
                              )}
                              <FormControlLabel
                                control={<Checkbox size="small" checked={shipForm.notifyCustomer} onChange={(e) => setShipForm({ ...shipForm, notifyCustomer: e.target.checked })} />}
                                label={<Typography variant="body2">Email the customer about this update</Typography>}
                              />
                              <Typography variant="caption" sx={{ color: '#888', mt: -1 }}>
                                The owner always receives a copy. Every save is recorded in the status history.
                              </Typography>
                              <Button
                                variant="contained"
                                disableElevation
                                onClick={handleShippingSave}
                                disabled={savingShip}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, alignSelf: 'flex-start' }}
                              >
                                {savingShip ? 'Saving…' : shipForm.notifyCustomer ? 'Save & email customer' : 'Save'}
                              </Button>
                            </Stack>
                          )}
                          {Array.isArray(orderData.statusHistory) && orderData.statusHistory.length > 0 && (
                            <Box sx={{ mt: 2.5 }}>
                              <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Status history</Typography>
                              {[...orderData.statusHistory].reverse().map((h, i) => (
                                <Box key={i} sx={{ display: 'flex', gap: 1.5, py: 0.75, borderTop: '1px solid #f3f3f3', fontSize: 13 }}>
                                  <Box sx={{ color: '#888', minWidth: 150, flex: 'none' }}>{h.at ? new Date(h.at).toLocaleString() : ''}</Box>
                                  <Box>
                                    <strong style={{ color: getStatusColor(h.status) }}>{statusLabel(h.status)}</strong>
                                    {h.carrier ? ` · ${h.carrier}` : ''}{h.trackingNumber ? ` · ${h.trackingNumber}` : ''}
                                    {h.by ? <span style={{ color: '#999' }}> · by {h.by}</span> : null}
                                    {h.customerNotified === false ? <span style={{ color: '#999' }}> · customer not emailed</span> : null}
                                    {h.note ? <div style={{ color: '#666' }}>{h.note}</div> : null}
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ) : <Typography sx={{ color: '#999' }}>No shipping info</Typography>}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 3 }}>
                    {sectionTitle(<Payments />, "Billing Details")}
                    {orderData?.billing_Details?.length ? (
                      <Box>
                        <Typography sx={{ color: '#333', fontWeight: 'bold', mb: 0.5 }}>
                          {orderData.billing_Details[0]?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#37a6ff', mb: 1, fontWeight: 600 }}>
                          {orderData.billing_Details[0]?.email}
                        </Typography>
                        <Box sx={{ color: '#666', lineHeight: 1.6, fontSize: '0.875rem' }}>
                          {typeof orderData.billing_Details[0]?.address === 'object' ? (
                            <>
                              {orderData.billing_Details[0].address.line1 && <>{orderData.billing_Details[0].address.line1}<br /></>}
                              {orderData.billing_Details[0].address.line2 && <>{orderData.billing_Details[0].address.line2}<br /></>}
                              {(orderData.billing_Details[0].address.city || orderData.billing_Details[0].address.state) && (
                                <>{[orderData.billing_Details[0].address.city, orderData.billing_Details[0].address.state].filter(Boolean).join(', ')}<br /></>
                              )}
                              {orderData.billing_Details[0].address.country} {orderData.billing_Details[0].address.postal_code}
                            </>
                          ) : (
                            <Typography variant="body2">{orderData.billing_Details[0]?.address || 'N/A'}</Typography>
                          )}
                        </Box>

                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                          <Typography variant="caption" sx={{ color: '#888' }}>Payment Status & Info</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Method</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                {orderData.paymentMethod || (orderData.isCOD ? 'COD' : 'Stripe')}
                              </Typography>
                            </Box>
                            <Chip
                              label={orderData.paymentStatus || 'Unpaid'}
                              size="small"
                              sx={{
                                bgcolor: orderData.paymentStatus === 'paid' ? '#e8f5e9' : '#fff8e1',
                                color: orderData.paymentStatus === 'paid' ? '#2e7d32' : '#f57f17',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                          {orderData.cardLast4 && orderData.cardLast4 !== 'N/A' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#666', mt: 1 }}>
                              <Payments sx={{ fontSize: 16 }} />
                              <Typography variant="caption" fontWeight="bold">**** {orderData.cardLast4.replace('**** ', '')}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ) : <Typography sx={{ color: '#999' }}>No billing info</Typography>}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Products List */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                {sectionTitle(<Inventory />, "Purchased Items")}
                <Divider sx={{ mb: 3 }} />
                {orderData?.cartData?.length ? (
                  <List>
                    {orderData.cartData.map((item, index) => {
                      // Robust image path extraction with extended fallbacks
                      let productImage = null;

                      // 1. Custom design image (highest priority)
                      if (item?.designId && typeof item.designId === 'object' && item.designId.custom_image) {
                        productImage = item.designId.custom_image;
                      }
                      // 2. Standard product image from populated 'id' field
                      else if (item?.id && typeof item.id === 'object' && item.id.frontImage) {
                        productImage = item.id.frontImage;
                      }
                      // 3. Fallback to otherImages[0] if frontImage is missing
                      else if (item?.id && typeof item.id === 'object' && item.id.otherImages?.length > 0) {
                        productImage = item.id.otherImages[0];
                      }
                      // 4. Direct frontImage on item (legacy format)
                      else if (item?.frontImage) {
                        productImage = item.frontImage;
                      }
                      // 5. Check _id field (alternative reference field name)
                      else if (item?._id && typeof item._id === 'object' && item._id.frontImage) {
                        productImage = item._id.frontImage;
                      }
                      // 6. Check product field (nested product object)
                      else if (item?.product && item.product.frontImage) {
                        productImage = item.product.frontImage;
                      }
                      // 7. Direct image or thumbnail field
                      else if (item?.image || item?.thumbnail) {
                        productImage = item.image || item.thumbnail;
                      }

                      // The chain above reaches for the design render first,
                      // which is right for a jacket the customer built and wrong
                      // for a catalogue one — those carry a design too, so the
                      // studio render displaced the shop's own product photo.
                      // When the line resolved to a product, its photograph wins.
                      const shopProductDoc = item?.id && typeof item.id === 'object' ? item.id : null;
                      const shopProductShot = shopProductDoc
                        ? (shopProductDoc.frontImage || shopProductDoc.otherImages?.[0] || '')
                        : '';
                      if (shopProductShot) {
                        productImage = shopProductShot;
                      }

                      productImage = usableProductImage(item, productImage);

                      // Having a designId does NOT make a line custom: catalogue
                      // jackets are themselves built in the customiser, so a
                      // shop product carries one too (which is why the spec
                      // block renders for them). The field that actually
                      // separates the two is `id` — the checkout sends
                      // `id: null` for a jacket the customer designed, and the
                      // product's _id for anything off the shelf.
                      const isCustomDesign = !item?.id && Boolean(item?.designId);

                      // Same trap as the image and the badge: a catalogue jacket
                      // has a designId, so branching on it first sent "View
                      // Product" to the design studio instead of the product
                      // page on the storefront. A shop line goes to its product
                      // page; only a jacket the customer built goes to /Design.
                      const productSlug = String(shopProductDoc?.slug || item?.slug || '').trim().toLowerCase();
                      const designRef = item?.designId?._id || item?.designId || '';
                      const storefrontUrl = isCustomDesign
                        ? (designRef ? `${STOREFRONT_URL}/Design/${designRef}?custom=true` : '')
                        : (productSlug ? `${STOREFRONT_URL}/product/${productSlug}` : '');

                      // Debug logging for missing images
                      if (!productImage) {
                        console.warn(`[OrderDetails] Missing image for item ${index + 1}:`, {
                          name: item?.name,
                          hasDesignId: !!item?.designId,
                          designIdType: typeof item?.designId,
                          hasId: !!item?.id,
                          idType: typeof item?.id,
                          idValue: item?.id
                        });
                      }

                      const renderDesignSpecs = (design) => {
                        if (!design) return null;

                        const toTitleCase = (str) => {
                          if (!str) return '';
                          return str.toString().replace(
                            /\w\S*/g,
                            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                          );
                        };

                        const renderValue = (value, isColor = false, keyName = "", productId = "") => {
                          if (!value || value === 'null' || value === 'undefined') return "None";

                          // Hardcoded suppression for specific products and pocket locations
                          const pocketKeys = ["left pocket", "right pocket"];
                          const restrictedProductIds = ["5995", "4893"]; // Hoodie and Ladies Varsity
                          if (keyName && productId && pocketKeys.includes(keyName.toLowerCase()) && restrictedProductIds.includes(productId.toString())) {
                            return "None";
                          }

                          // If it's a simple color value (for general specs)
                          if (isColor && typeof value === 'string') {
                            const colorObj = properties.colors?.find(c => c.code?.toLowerCase() === value?.toLowerCase());
                            const colorCode = colorObj ? colorObj.code : (value.startsWith('#') ? value : null);
                            const colorName = colorObj ? toTitleCase(colorObj.name) : (value.startsWith('#') ? value.toUpperCase() : toTitleCase(value));

                            if (colorCode) {
                              return (
                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, verticalAlign: 'middle' }}>
                                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: colorCode, border: '1px solid #ccc' }} />
                                  {colorName}
                                </Box>
                              );
                            }
                          }

                          if (typeof value === 'object' && value !== null) {
                            if (Object.keys(value).length === 0) return "None";

                            let mainLabel = "";
                            let imageContent = null;
                            let colorSpecs = [];
                            let fontInfo = null;

                            // 0. Extract Base Colors (Scope Fix)
                            const fillColor = value.fill || value.letters?.fill || value.name?.fill || value.symbol?.fill || value.color || design.fill;
                            const strokeColor = value.stroke || value.letters?.stroke || value.name?.stroke || value.symbol?.stroke || value.symbol?.strokeColor || design.stroke;
                            const borderColor = value.border || value.letters?.border || value.name?.border || value.symbol?.border || value.symbol?.borderColor || design.border;

                            // 1. Determine main label and extract images (for mascots/flags first)
                            if (value.symbol?.type) {
                              mainLabel = value.symbol.type;
                              const typeLower = String(value.symbol.type).toLowerCase(); // a damaged design must not blank the page
                              const id = value.symbol.flag || value.symbol.id;
                              if (typeLower === 'mascots' && id) {
                                imageContent = `/assets/images/mascots/${id}.svg`;
                                mainLabel = `Mascot (${id})`;
                              } else if (typeLower === 'flags' && id) {
                                imageContent = `/assets/images/flags/${id}.svg`;
                                mainLabel = `Flag (${toTitleCase(id.toString())})`;
                              } else if (value.symbol.name) {
                                mainLabel = value.symbol.name;
                              }
                            }

                            // 2. Extract text label if not a special type (FIXED PRIORITY ORDER)
                            if (!mainLabel || mainLabel === value.symbol?.type || mainLabel === "Assigned") {
                              // PRIORITIZE: Direct text fields first, then fallback to nested fields
                              if (value.text) mainLabel = value.text;
                              else if (value.custom_text) mainLabel = value.custom_text;
                              else if (value.symbol?.text) mainLabel = value.symbol.text;
                              else if (value.letters?.text) mainLabel = value.letters.text;
                              else if (value.name?.text) mainLabel = value.name.text;
                              else if (value.title) mainLabel = value.title;
                              else if (value.letters?.title) mainLabel = value.letters.title;
                              else if (value.name?.title) mainLabel = value.name.title;
                              else if (typeof value.symbol?.id === 'string' && value.symbol.id.length > 0 && value.symbol.id.length <= 3 && !value.symbol.id.includes('.svg') && !value.symbol.id.includes('.')) mainLabel = value.symbol.id;
                              else if (typeof value.name === 'string' && value.name.length > 0 && value.name !== 'null' && value.name !== 'undefined') mainLabel = value.name;
                              else if (value.upload?.file || value.custom_image || value.image) {
                                mainLabel = "Custom Upload";
                                imageContent = value.upload?.file || value.custom_image || value.image;
                              } else if (value.done) {
                                mainLabel = "Assigned";
                              }
                            }

                            // 3. Extract Font FIRST (check all possible locations with correct priority)
                            fontInfo = value.font || value.letters?.font || value.name?.font || value.symbol?.font ||
                              value.fontFamily || value.letters?.fontFamily || value.name?.fontFamily || value.symbol?.fontFamily ||
                              design.font; // Fallback to global font if not patch-specific

                            // Helper to check if label is system-generated
                            const isSystemLabel = (lbl) => {
                              if (!lbl) return true;
                              const lower = lbl.toLowerCase();
                              return lower === 'assigned' || lower === 'custom upload' || lower.startsWith('mascot') || lower.startsWith('flag');
                            };

                            // Force Uppercase for specific fonts - APPLY IMMEDIATELY AFTER EXTRACTION
                            const uppercaseFonts = ["rookie", "baseball", "graduate", "freshman", "varsity"];
                            const isForcedFont = fontInfo && uppercaseFonts.some(f => fontInfo.toLowerCase().includes(f));

                            // Apply uppercase transformation if needed
                            if (mainLabel && !isSystemLabel(mainLabel) && isForcedFont) {
                              mainLabel = mainLabel.toUpperCase();
                            }

                            // 4. Extract Colors
                            const typeLower = value.symbol?.type?.toLowerCase() || "";
                            let colorsToCheck = ['fill', 'stroke', 'border'];
                            if (typeLower === 'mascots') {
                              colorsToCheck = ['stroke']; // Only stroke for mascots
                            } else if (typeLower === 'flags') {
                              colorsToCheck = ['fill']; // Only fill for flags (no stroke/border)
                            }

                            colorsToCheck.forEach(cKey => {
                              const cVal = value[cKey] || value.letters?.[cKey] || value.name?.[cKey] || value.symbol?.[cKey] || value.symbol?.[cKey + 'Color'] ||
                                (cKey === 'fill' ? design.fill : (cKey === 'stroke' ? design.stroke : design.border)); // Robust fallback to design colors
                              if (cVal && cVal !== 'none' && typeof cVal === 'string' && cVal.startsWith('#')) {
                                // Try to find color name in properties.colors
                                const colorObj = properties.colors?.find(c => c.code?.toLowerCase() === cVal.toLowerCase());
                                const colorName = colorObj ? toTitleCase(colorObj.name) : cVal;
                                colorSpecs.push({ label: toTitleCase(cKey), code: cVal, name: colorName });
                              }
                            });

                            // 5. SVG Path Detection (Prioritize graphics over generic selection labels)
                            // FIX 'C instead of T': Check if we are in "Type Your Own" mode or have a font selected
                            const designMode = value.type || value.letters?.type || value.name?.type ||
                              (value.font || value.letters?.font || value.name?.font ? "Type Your Own" : "Ready To Use");
                            const isTypeMode = designMode === "Type Your Own";

                            if (!imageContent) {
                              const hasValidPath = isSvgString(value.path) || isSvgString(value.letters?.path);

                              // ONLY use path if we are NOT in Type Mode or if it's explicitly a graphics patch
                              // This prevents stale SVG paths (from switching modes) from overriding typed text
                              if (hasValidPath && (!isTypeMode || (!mainLabel || isSystemLabel(mainLabel)))) {
                                let pathVal = isSvgString(value.path) ? value.path : value.letters.path;

                                // INJECT extracted colors into SVG string
                                if (pathVal) {
                                  // 1. Identify layers
                                  const fillMatches = pathVal.match(/fill=(["'])[^"']*\1/g) || [];
                                  const strokeMatches = pathVal.match(/stroke=(["'])[^"']*\1/g) || [];

                                  // 2. Inject Fills (Surgical layered replacement)
                                  if (fillMatches.length > 0) {
                                    let fIndex = 0;
                                    pathVal = pathVal.replace(/fill=(["'])[^"']*\1/g, (match) => {
                                      fIndex++;
                                      // Heuristic: bottom layers first
                                      // 3 layers: 1=Border, 2=Stroke, 3=Fill (Common for varsity body)
                                      if (fillMatches.length === 3) {
                                        if (fIndex === 1 && borderColor) return `fill="${borderColor}"`;
                                        if (fIndex === 2 && (strokeColor || borderColor)) return `fill="${strokeColor || borderColor}"`;
                                        return `fill="${fillColor}"`;
                                      }
                                      // 2 layers: 1=Stroke/Border, 2=Fill
                                      if (fillMatches.length === 2) {
                                        if (fIndex === 1 && (borderColor || strokeColor)) return `fill="${borderColor || strokeColor}"`;
                                        return `fill="${fillColor}"`;
                                      }
                                      return `fill="${fillColor}"`;
                                    });
                                  } else if (fillColor && pathVal.includes('<path')) {
                                    pathVal = pathVal.replace('<path', `<path fill="${fillColor}"`);
                                  }

                                  // 3. Inject Strokes
                                  if (strokeMatches.length > 0) {
                                    let sIndex = 0;
                                    pathVal = pathVal.replace(/stroke=(["'])[^"']*\1/g, (match) => {
                                      sIndex++;
                                      // Heuristic: Outer border first (1), Inner stroke second (2)
                                      if (strokeMatches.length >= 2) {
                                        if (sIndex === 1 && borderColor) return `stroke="${borderColor}"`;
                                        return `stroke="${strokeColor || borderColor}"`;
                                      }
                                      return `stroke="${strokeColor || borderColor}"`;
                                    });
                                  } else if ((strokeColor || borderColor) && pathVal.includes('<path')) {
                                    pathVal = pathVal.replace('<path', `<path stroke="${strokeColor || borderColor}"`);
                                  }
                                }

                                imageContent = svgToDataUrl(pathVal);

                                // If we have a valid path but no label, or just 'Assigned', promote it
                                if (!mainLabel || mainLabel === "Assigned") {
                                  mainLabel = "Custom Design";
                                } else if (typeof mainLabel === 'string' && mainLabel.length === 1 && mainLabel === "I") {
                                  // Specifically block the technical placeholder artifact 'I'
                                  imageContent = null;
                                }
                              }
                            }

                            // 6. Text Preview Fallback (Allow even for "Assigned" if real matter exists)
                            if (!imageContent && mainLabel && typeof mainLabel === 'string' && mainLabel.length > 0) {
                              const fill = fillColor;
                              const stroke = strokeColor;
                              const border = borderColor;

                              // Re-extract font if not already present (safety check)
                              if (!fontInfo) {
                                fontInfo = value.font || value.letters?.font || value.name?.font || value.symbol?.font ||
                                  value.fontFamily || value.letters?.fontFamily || value.name?.fontFamily || value.symbol?.fontFamily;
                              }

                              if (fill || stroke || border || fontInfo) {
                                // IMPORTANT: Don't re-extract text, use mainLabel directly for preview
                                let previewLabel = mainLabel;

                                // ONLY if mainLabel is still "Assigned" should we try to find actual text
                                if (previewLabel === "Assigned") {
                                  // Try to find any text, but this should rarely happen
                                  const foundText = value.text || value.symbol?.text || value.letters?.text || value.name?.text;
                                  if (foundText) {
                                    previewLabel = foundText;

                                    // Apply uppercase transformation if needed
                                    const isForcedFontPreview = fontInfo && uppercaseFonts.some(f => fontInfo.toLowerCase().includes(f));
                                    if (isForcedFontPreview) {
                                      previewLabel = previewLabel.toUpperCase();
                                    }
                                  } else {
                                    // If no actual text, don't generate a preview of "Assigned"
                                    return (
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>Assigned</Typography>
                                        {colorSpecs.length > 0 && (
                                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                            {colorSpecs.map((cs, idx) => (
                                              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f9f9f9', px: 0.8, py: 0.3, borderRadius: 10, border: '1px solid #efefef' }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cs.code, border: '1px solid #ccc' }} />
                                                <Typography variant="caption" sx={{ fontSize: '10px', color: '#555', fontWeight: 500 }}>{cs.label}: {cs.name}</Typography>
                                              </Box>
                                            ))}
                                          </Box>
                                        )}
                                      </Box>
                                    );
                                  }
                                }

                                // Generate preview only if valid text exists
                                if (previewLabel && previewLabel.length >= 1 && previewLabel !== "I") {
                                  // Straight or Arc is chosen per patch in the
                                  // customiser, so the preview has to follow it
                                  // — a flat render of an arced name is not what
                                  // gets stitched.
                                  const patchAppearance = value.appearance
                                    || value.name?.appearance
                                    || value.letters?.appearance
                                    || 'Straight';
                                  imageContent = generateTextPreview(previewLabel, fontInfo || 'Arial', fill, stroke, border, patchAppearance);
                                }
                              }
                            }

                            return (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                                  {isSystemLabel(mainLabel) ? toTitleCase(mainLabel || "Design Assigned") : mainLabel}
                                </Typography>

                                {imageContent && (
                                  <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                                    <Box
                                      sx={{
                                        width: '100%', height: '100%',
                                        bgcolor: '#fff',
                                        border: '1px solid #eee',
                                        borderRadius: 1,
                                        overflow: 'hidden', p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => handleOpenModal(imageContent, mainLabel)}
                                    >
                                      <img src={uploadUrl(imageContent)} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                                    </Box>
                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        bottom: -10,
                                        right: -10,
                                        bgcolor: '#37a6ff',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#1e88e5' },
                                        width: 24,
                                        height: 24,
                                        boxShadow: 2
                                      }}
                                      title="Download Image"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDownloadImage(imageContent, mainLabel);
                                      }}
                                    >
                                      <DownloadIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  </Box>
                                )}

                                {colorSpecs.length > 0 && (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                    {colorSpecs.map((cs, idx) => (
                                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f9f9f9', px: 0.8, py: 0.3, borderRadius: 10, border: '1px solid #efefef' }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cs.code, border: '1px solid #ccc' }} />
                                        <Typography variant="caption" sx={{ fontSize: '10px', color: '#555', fontWeight: 500 }}>
                                          {cs.label}: {cs.name}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                )}

                                {fontInfo && (
                                  <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic' }}>
                                    Font: {fontInfo}
                                  </Typography>
                                )}
                                {(value.appearance || value.name?.appearance || value.letters?.appearance) && (
                                  <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic' }}>
                                    Style: {value.appearance || value.name?.appearance || value.letters?.appearance}
                                  </Typography>
                                )}
                              </Box>
                            );
                          }

                          if (typeof value === 'boolean') return value ? "Included" : "None";
                          return toTitleCase(value?.toString() || "");
                        };

                        // builder bookkeeping, not part of the jacket
                        const HIDDEN_SPEC_KEYS = ['defaults', 'section', 'price'];
                        const filterEntries = (entries) => entries.filter(([key]) => {
                          const k = key.toLowerCase();
                          if (HIDDEN_SPEC_KEYS.includes(k)) return false;
                          if (k === 'insertscount') return Boolean(design.advance?.inserts);
                          return true;
                        });
                        const SPEC_NAMES = { custom: 'Custom Measurements', insertsCount: 'Number Of Inserts' };
                        const keyLabel = (key) => SPEC_NAMES[key] || toTitleCase(String(key).replace(/([a-z])([A-Z])/g, '$1 $2'));
                        const SCALES = { in: 'Inches', cm: 'Centimetres' };

                        const ALL_PATCH_POSITIONS = [
                          "Front Center", "Left Chest", "Right Chest",
                          "Back Top", "Back Middle", "Back Bottom",
                          "Left Sleeve", "Right Sleeve",
                          "Left Mid Sleeve Upper", "Right Mid Sleeve Upper",
                          "Left Mid Sleeve Lower", "Right Mid Sleeve Lower",
                          "Left Sleeve End", "Right Sleeve End",
                          "Left Pocket", "Right Pocket",
                          "Hood Left", "Hood Right"
                        ];

                        const productId = design.productId || design.id || design._id || "";

                        return (
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f4f8', borderRadius: 2, border: '1px dashed #cfd8dc' }}>
                            {(() => {
                              // the four renders the builder saved with the design (front, back and both sides)
                              const views = [['Front', design.custom_image], ['Back', design.custom_image_back], ['Left', design.custom_image_left], ['Right', design.custom_image_right]]
                                .filter(([, src]) => typeof src === 'string' && src && !DEAD_IMAGE_HOST.test(src));
                              if (!views.length) return null;
                              return (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#37a6ff', mb: 1 }}>
                                    Design Views
                                  </Typography>
                                  <Grid container spacing={1.5}>
                                    {views.map(([label, src]) => (
                                      <Grid item xs={6} sm={3} key={label}>
                                        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e8ee', borderRadius: 2, p: 1, transition: 'border-color .2s', '&:hover': { borderColor: '#37a6ff' } }}>
                                          <Box
                                            component="img"
                                            src={uploadUrl(src)}
                                            alt={`${item.name} — ${label} view`}
                                            onClick={() => handleOpenModal(uploadUrl(src), `${item.name} — ${label} view`)}
                                            sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', display: 'block', cursor: 'zoom-in' }}
                                          />
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>{label}</Typography>
                                            <IconButton size="small" aria-label={`Download the ${label.toLowerCase()} view`} onClick={() => handleDownloadImage(uploadUrl(src), `${orderData?.orderId || 'order'}-${label.toLowerCase()}`)}>
                                              <DownloadIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                          </Box>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              );
                            })()}
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#37a6ff', mb: 1 }}>
                              Custom Design Specifications
                            </Typography>
                            <Grid container spacing={1}>
                              {filterEntries(Object.entries(design.styles || {})).map(([key, value]) => (
                                <Grid item xs={6} sm={4} key={key}>
                                  <Typography component="div" variant="body2" sx={{ display: 'block', color: '#666' }}>
                                    <span style={{ fontWeight: 600 }}>{keyLabel(key)}:</span> {renderValue(key === 'scale' ? (SCALES[value] || value) : value, false, key, productId)}
                                  </Typography>
                                </Grid>
                              ))}
                              {filterEntries(Object.entries(design.advance || {})).map(([key, value]) => (
                                <Grid item xs={6} sm={4} key={key}>
                                  <Typography component="div" variant="body2" sx={{ display: 'block', color: '#666' }}>
                                    <span style={{ fontWeight: 600 }}>{keyLabel(key)}:</span> {renderValue(key === 'scale' ? (SCALES[value] || value) : value, false, key, productId)}
                                  </Typography>
                                </Grid>
                              ))}
                              {filterEntries(Object.entries(design.colors || {})).map(([key, value]) => (
                                <Grid item xs={6} sm={4} key={key}>
                                  <Typography component="div" variant="body2" sx={{ display: 'block', color: '#666' }}>
                                    <span style={{ fontWeight: 600 }}>{keyLabel(key)} Color:</span> {renderValue(value, true, key, productId)}
                                  </Typography>
                                </Grid>
                              ))}
                              {filterEntries(Object.entries(design.materials || {})).map(([key, value]) => (
                                <Grid item xs={6} sm={4} key={key}>
                                  <Typography component="div" variant="body2" sx={{ display: 'block', color: '#666' }}>
                                    <span style={{ fontWeight: 600 }}>{keyLabel(key)} Material:</span> {renderValue(value, false, key, productId)}
                                  </Typography>
                                </Grid>
                              ))}
                              {filterEntries(Object.entries(design.sizes || {})).map(([key, value]) => (
                                <Grid item xs={6} sm={4} key={key}>
                                  <Typography component="div" variant="body2" sx={{ display: 'block', color: '#666' }}>
                                    <span style={{ fontWeight: 600 }}>{keyLabel(key)}:</span> {renderValue(key === 'scale' ? (SCALES[value] || value) : value, false, key, productId)}
                                  </Typography>
                                </Grid>
                              ))}
                            </Grid>

                            {/* Patches & Decorations Section */}
                            <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #cfd8dc' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#37a6ff', mb: 1 }}>
                                Patches & Decorations
                              </Typography>
                              <Grid container spacing={1}>
                                {ALL_PATCH_POSITIONS.map((pos) => (
                                  <Grid item xs={6} sm={4} key={pos}>
                                    <Typography component="div" variant="body2" sx={{ display: 'block', color: '#666' }}>
                                      <span style={{ fontWeight: 600 }}>{toTitleCase(pos)}:</span> {renderValue(design.designs?.[pos] || design.advance?.[pos], false, pos, productId)}
                                    </Typography>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          </Box>
                        );
                      };

                      return (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            bgcolor: '#f8f9fa',
                            mb: 2,
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #eee',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#37a6ff', bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Box
                                onClick={productImage ? () => handleOpenModal(productImage, item.name) : undefined}
                                sx={{
                                  position: 'relative',
                                  width: 80,
                                  height: 80,
                                  flexShrink: 0,
                                  cursor: productImage ? 'zoom-in' : 'default',
                                  '&:hover .order-item-zoom': productImage ? { opacity: 1 } : {},
                                }}
                              >
                                <Avatar
                                  id={`product-avatar-${index}`}
                                  src={uploadUrl(productImage)}
                                  variant="rounded"
                                  sx={{ width: 80, height: 80, bgcolor: '#eee', border: '1px solid #ddd' }}
                                >
                                  <Inventory sx={{ color: '#ccc' }} />
                                </Avatar>
                                {productImage && (
                                  <Box
                                    className="order-item-zoom"
                                    sx={{
                                      position: 'absolute',
                                      inset: 0,
                                      borderRadius: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: 'rgba(0,0,0,0.45)',
                                      color: '#fff',
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    <ZoomIn fontSize="small" />
                                  </Box>
                                )}
                              </Box>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography sx={{ color: '#333', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {item.name}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={isCustomDesign ? 'Custom Design' : 'Shop Product'}
                                    sx={{
                                      height: 22,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      borderRadius: '6px',
                                      bgcolor: isCustomDesign ? '#ede7f6' : '#e8f5e9',
                                      color: isCustomDesign ? '#5e35b1' : '#2e7d32',
                                      border: `1px solid ${isCustomDesign ? '#d1c4e9' : '#c8e6c9'}`
                                    }}
                                  />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                  <Typography variant="body2" sx={{ color: '#666' }}>
                                    Qty: <span style={{ color: '#333', fontWeight: 600 }}>{item.quantity}</span>
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#666' }}>
                                    Price: <span style={{ color: '#37a6ff', fontWeight: 600 }}>${item.price}</span>
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
                                  SKU: {item?._id?.sku || item?.id?.sku || 'Custom Design'}
                                </Typography>
                              </Box>
                            </Box>
                            {/* Without a slug the old link built
                                easyjackets.com/product/ — a dead end. Nothing to
                                open, so nothing to click. */}
                            {storefrontUrl && (
                            <Button
                              variant="outlined"
                              size="small"
                              component="a"
                              href={storefrontUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<OpenInNew />}
                              sx={{
                                color: '#37a6ff',
                                borderColor: '#37a6ff',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                '&:hover': { borderColor: '#1e88e5', bgcolor: 'rgba(55, 166, 255, 0.05)' }
                              }}
                            >
                              {isCustomDesign ? 'View Design' : 'View Product'}
                            </Button>
                            )}
                          </Box>
                          {/* Render Custom Design Details */}
                          {item.designId && typeof item.designId === 'object' && renderDesignSpecs(item.designId)}
                        </Paper>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Inventory sx={{ fontSize: 48, color: '#eee', mb: 2 }} />
                    <Typography sx={{ color: '#999' }}>No products found in this order.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Image Popup Modal */}
      <Dialog
        open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: '#f5f5f5', overflow: 'hidden' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {selectedImage?.label ? `Viewing: ${selectedImage.label}` : 'Image Preview'}
          </Typography>
          <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#e0e0e0', minHeight: '300px' }}>
          {selectedImage?.url && <img src={uploadUrl(selectedImage.url)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }} />}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #eee' }}>
          <Button onClick={handleCloseModal} color="inherit" sx={{ textTransform: 'none', fontWeight: 'bold' }}>Close</Button>
          <Button
            variant="contained" startIcon={<DownloadIcon />}
            onClick={() => handleDownloadImage(selectedImage.url, selectedImage.label)}
            sx={{ bgcolor: '#37a6ff', '&:hover': { bgcolor: '#1e88e5' }, textTransform: 'none', fontWeight: 'bold' }}
          >
            Download Image
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;
