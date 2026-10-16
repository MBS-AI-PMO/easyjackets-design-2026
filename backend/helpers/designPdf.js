import PDFDocument from 'pdfkit';
import { designSummary } from './designSummary.js';

// The PDF attached to the shared-design email: the jacket's four views and its full specification (the build,
// extras, colours and the artwork on every placement), with links back to the design. Drawn with pdfkit, plain
// JavaScript: it replaced html-pdf, which ran the PhantomJS browser (abandoned since 2018, with packages that
// had critical security advisories) to print the email's HTML.

const INK = '#14110f';
const MUTED = '#6b635a';
const GOLD = '#a8861c';
const LINE = '#e9e1d2';
const CREAM = '#fbf8f2';

const money = (value) => {
  const n = Number(value) || 0;
  return `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
};

/**
 * @param {object} data           the shared design (styles, materials, colours, designs …, custom_price)
 * @param {Array<{label: string, buffer: Buffer}>} views  the views as PNG (helpers/designImages.js)
 * @param {{ resumeUrl?: string, reviewUrl?: string, siteUrl?: string }} links
 * @returns {Promise<Buffer>}
 */
export const designPdf = (data, views = [], { resumeUrl = '', reviewUrl = '', siteUrl = '' } = {}) => new Promise((resolve, reject) => {
  try {
    const summary = designSummary(data);
    const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: `${summary.name} · Easy Jackets`, Author: 'Easy Jackets' } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const bottom = () => doc.page.height - doc.page.margins.bottom;
    const room = (height) => { if (doc.y + height > bottom()) doc.addPage(); };

    const section = (title) => {
      room(60);
      doc.moveDown(1.1);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD).text(title.toUpperCase(), left, doc.y, { characterSpacing: 1.6 });
      const y = doc.y + 4;
      doc.moveTo(left, y).lineTo(left + width, y).lineWidth(1.5).strokeColor(INK).stroke();
      doc.y = y + 8;
    };

    const row = (key, value, swatch) => {
      const keyWidth = width * 0.38;
      doc.font('Helvetica').fontSize(10);
      const height = Math.max(doc.heightOfString(key, { width: keyWidth }), doc.heightOfString(value, { width: width - keyWidth - 18 })) + 12;
      room(height);
      const y = doc.y;
      doc.fillColor(MUTED).text(key, left, y + 6, { width: keyWidth });
      let x = left + keyWidth;
      if (swatch) {
        doc.circle(x + 6, y + 12, 5).fillAndStroke(swatch, '#b9b0a3');
        x += 18;
      }
      doc.font('Helvetica-Bold').fillColor(INK).text(value, x, y + 6, { width: width - (x - left) });
      const end = y + height;
      doc.moveTo(left, end).lineTo(left + width, end).lineWidth(0.6).strokeColor(LINE).stroke();
      doc.y = end;
    };

    // ---- heading ----
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD).text('EASY JACKETS · YOUR DESIGN', { characterSpacing: 1.8 });
    doc.moveDown(0.4);
    doc.font('Helvetica-Bold').fontSize(26).fillColor(INK).text(summary.name);
    const price = Number(data?.custom_price) || 0;
    if (price > 0) {
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(12).fillColor(MUTED).text(`Price as designed: `, { continued: true }).font('Helvetica-Bold').fillColor(INK).text(money(price));
    }

    // ---- views, two per row ----
    const shown = views.filter((v) => v?.buffer);
    if (shown.length) {
      section('Every view');
      const gap = 12;
      const cell = (width - gap) / 2;
      const imageHeight = cell * 0.95;
      for (let i = 0; i < shown.length; i += 2) {
        room(imageHeight + 30);
        const y = doc.y;
        shown.slice(i, i + 2).forEach((view, j) => {
          const x = left + j * (cell + gap);
          doc.roundedRect(x, y, cell, imageHeight + 24, 4).fillAndStroke(CREAM, LINE);
          try {
            doc.image(view.buffer, x + 10, y + 8, { fit: [cell - 20, imageHeight - 8], align: 'center', valign: 'center' });
          } catch (error) {
            console.error(`PDF: the ${view.label} view could not be drawn:`, error.message);
          }
          doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text(String(view.label).toUpperCase(), x, y + imageHeight + 6, { width: cell, align: 'center', characterSpacing: 1.4 });
        });
        doc.y = y + imageHeight + 24 + gap;
      }
    }

    // ---- the specification ----
    if (summary.build.length) {
      section('The build');
      summary.build.forEach(([key, value]) => row(key, value));
    }
    if (summary.extras.length) {
      section('Extras');
      summary.extras.forEach((extra) => row(extra, 'Yes'));
    }
    if (summary.colors.length) {
      section('Colours');
      summary.colors.forEach(([key, hex]) => row(key, hex, hex));
    }
    if (summary.artwork.length) {
      section('Artwork');
      summary.artwork.forEach((a) => row(a.place, a.text || '—', a.colors?.[0]));
    }

    // ---- links back ----
    if (resumeUrl || reviewUrl || siteUrl) {
      section('Keep going');
      doc.font('Helvetica').fontSize(10).fillColor(INK);
      if (resumeUrl) { room(18); doc.text('Continue designing: ', left, doc.y, { continued: true }).fillColor(GOLD).text(resumeUrl, { link: resumeUrl, underline: true }); doc.fillColor(INK); }
      if (reviewUrl) { room(18); doc.moveDown(0.3).text('See every view and the full spec: ', left, doc.y, { continued: true }).fillColor(GOLD).text(reviewUrl, { link: reviewUrl, underline: true }); doc.fillColor(INK); }
      if (siteUrl) { room(18); doc.moveDown(0.3).fillColor(MUTED).text(siteUrl.replace(/^https?:\/\//, ''), left, doc.y, { link: siteUrl }); }
    }

    doc.end();
  } catch (error) {
    reject(error);
  }
});
