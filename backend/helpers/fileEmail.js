import pdf from 'html-pdf';
import fs from 'fs';
import { createRequire } from 'module';
import { getTransporter, getEmailSettings, formatFrom } from './emailSettings.js';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs'
import { prepareDesignImages } from './designImages.js';
import { designStudioUrl, storefrontUrl } from './customJacketUrl.js';
import { designSummary } from './designSummary.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Shared designs embed four full jacket renders as base64 data URIs, so the
// document PhantomJS has to rasterise is megabytes rather than kilobytes.
// html-pdf's own default is 30s, which those designs can outrun on a small
// container; PDF_TIMEOUT_MS makes it tunable without a code change.
const PDF_TIMEOUT_MS = Number(process.env.PDF_TIMEOUT_MS) || 45000;

// html-pdf shells out to PhantomJS, which it declares as an OPTIONAL dependency
// with a download-on-install step. npm treats a failed optional install as a
// success, so a container can build green with no renderer in it at all and only
// find out at the first share. Say which of those happened, in the log, rather
// than leaving "PDF generation failed" to be guessed at.
const describeRenderer = () => {
    try {
        const binary = createRequire(import.meta.url)('phantomjs-prebuilt').path;
        return fs.existsSync(binary)
            ? `phantomjs binary present at ${binary}`
            : `phantomjs binary MISSING - phantomjs-prebuilt installed but its download step never ran (expected at ${binary})`;
    } catch (error) {
        return 'phantomjs-prebuilt is not installed at all - npm skipped the optional dependency';
    }
};

async function generatePDF(htmlContent) {
    return new Promise((resolve, reject) => {
        // pdf.create throws synchronously when the phantomjs binary is missing —
        // it is an optionalDependency of html-pdf, so an image can build fine
        // without it. Inside the executor that surfaces as a rejection.
        pdf.create(htmlContent, {
            childProcessOptions: {
                env: {
                    OPENSSL_CONF: '/dev/null',
                },
            },
            format: 'A4',
            // Page padding has to come from the paper, not the markup. A cell's
            // padding is laid down once at the start and once at the end of that
            // cell, so every continuation page began hard against the sheet edge.
            // paperSize.border is applied to every page, first and last included.
            border: { top: '13mm', right: '11mm', bottom: '13mm', left: '11mm' },
            timeout: PDF_TIMEOUT_MS
        }).toBuffer(function (err, buffer) {
            if (err) return reject(err)
            return resolve(buffer)
        })
    });
}

// Transport and addressing come from the admin-managed email configuration.

// The shared-design email, in the same design as the bulk quote and newsletter emails
// (helpers/views/bulkOrderCustomer.ejs): table layout and inline styles so it holds together in
// Gmail, Outlook and phone mail apps; the storefront's ink, cream and gold; a text wordmark.
const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const dot = (hex) => `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${esc(hex)};border:1px solid rgba(20,17,15,.25);vertical-align:-1px;"></span>`;

const sectionTitle = (text, top = 28) => `
        <tr><td class="px" style="padding:${top}px 36px 0;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;color:#a8861c;text-transform:uppercase;padding-bottom:10px;border-bottom:2px solid #14110f;">${esc(text)}</div>`;

const rowsTable = (rows) => `
          <table role="presentation" width="100%" style="font-family:Arial,Helvetica,sans-serif;">
            ${rows.map(([k, v]) => `
            <tr class="row">
              <td class="k" width="42%" style="padding:11px 12px 11px 0;border-bottom:1px solid #e9e1d2;font-size:13px;color:#6b635a;vertical-align:top;">${esc(k)}</td>
              <td style="padding:11px 0;border-bottom:1px solid #e9e1d2;font-size:14px;font-weight:700;color:#14110f;vertical-align:top;">${v}</td>
            </tr>`).join('')}
          </table>`;

const buildPreviewHtml = (previewImages = []) => {
    if (!previewImages.length) return '';
    const rows = [];
    for (let i = 0; i < previewImages.length; i += 2) rows.push(previewImages.slice(i, i + 2));
    return `${sectionTitle('Every view', 24)}
          <table role="presentation" width="100%" style="margin-top:12px;">
            ${rows.map((row) => `
            <tr>
              ${row.map((item) => `
              <td class="view" width="50%" style="width:50%;padding:6px;vertical-align:top;">
                <table role="presentation" width="100%" style="background:#ffffff;border:1px solid #e9e1d2;border-radius:4px;">
                  <tr><td style="padding:14px;text-align:center;">
                    <img src="cid:${item.cid}" alt="${esc(item.label)} view of the jacket" width="230" style="display:block;width:100%;max-width:230px;height:auto;margin:0 auto;border:0;">
                    <div style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;color:#6b635a;text-transform:uppercase;">${esc(item.label)}</div>
                  </td></tr>
                </table>
              </td>`).join('')}
              ${row.length === 1 ? '<td class="view" width="50%" style="width:50%;padding:6px;"></td>' : ''}
            </tr>`).join('')}
          </table>
        </td></tr>`;
};

export const buildDesignEmailHtml = (subject, data, previewImages, supportEmail = 'info@easyjackets.com', resumeUrl = designStudioUrl(), reviewUrl = '') => {
    const first = String(data.shareName || '').trim().split(/\s+/)[0] || 'there';
    const summary = designSummary(data);
    const name = summary.name;
    const price = Number(data.custom_price) || 0;
    const priceText = `$${Number.isInteger(price) ? price : price.toFixed(2)}`;
    const site = storefrontUrl();
    const build = summary.build.map(([k, v]) => [k, esc(v)]);
    const extras = summary.extras;
    const colors = summary.colors;
    const artwork = summary.artwork.map((a) => [a.place, a]);

    const button = (href, text, dark) => `<a href="${esc(href)}" style="display:inline-block;margin:0 10px 10px 0;padding:14px 22px;background:${dark ? '#14110f' : '#fbf8f2'};color:${dark ? '#f4efe6' : '#14110f'};border:2px solid #14110f;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:2px;">${esc(text)}</a>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <title>${esc(subject)}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4efe6; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    a { color: #a8861c; }
    @media only screen and (max-width: 560px) {
      .px { padding-left: 22px !important; padding-right: 22px !important; }
      .h1 { font-size: 34px !important; }
      .row td { display: block !important; width: auto !important; padding: 2px 0 !important; }
      .row td.k { padding-top: 12px !important; }
      .view { display: block !important; width: auto !important; }
      .price td { display: block !important; text-align: left !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4efe6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your ${esc(name.toLowerCase())}: every view, the full spec and a link to keep designing.</div>
  <table role="presentation" width="100%" style="background:#f4efe6;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" style="max-width:620px;background:#fbf8f2;border:1px solid #e9e1d2;border-radius:6px;overflow:hidden;">
        <!-- gold stripe, like the site's section rule -->
        <tr><td style="height:6px;background:#c9a227;line-height:6px;font-size:0;">&nbsp;</td></tr>
        <!-- header -->
        <tr><td class="px" style="background:#14110f;padding:30px 36px 34px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:900;letter-spacing:.22em;color:#f4efe6;">EASY JACKETS</div>
          <div style="height:26px;line-height:26px;font-size:0;">&nbsp;</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;color:#c9a227;text-transform:uppercase;">Design lab · ${esc(name)}</div>
          <div class="h1" style="margin-top:10px;font-family:'Arial Narrow','Helvetica Neue',Arial,sans-serif;font-size:42px;line-height:.98;font-weight:800;letter-spacing:-.01em;color:#f4efe6;text-transform:uppercase;">Your jacket design is ready.</div>
        </td></tr>
        <!-- intro -->
        <tr><td class="px" style="padding:30px 36px 6px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#14110f;">Hi ${esc(first)},</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#2a2521;">Here is the jacket you built in the Easy Jackets design lab: every view, and every detail of the build. The full specification is attached as a PDF. Pick up where you left off any time; every choice is still in place.</p>
        </td></tr>
        <!-- price -->
        <tr><td class="px" style="padding:10px 36px 0;">
          <table role="presentation" width="100%" class="price" style="background:#14110f;border-radius:4px;">
            <tr>
              <td style="padding:18px 22px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:11px;font-weight:700;letter-spacing:.16em;color:#c9a227;text-transform:uppercase;">Estimated total</div>
                <div style="margin-top:4px;font-size:12px;color:rgba(244,239,230,.62);">Includes all customizations · shipping at checkout</div>
              </td>
              <td align="right" style="padding:18px 22px;font-family:'Arial Narrow','Helvetica Neue',Arial,sans-serif;font-size:40px;line-height:1;font-weight:800;color:#c9a227;">${esc(priceText)}</td>
            </tr>
          </table>
        </td></tr>
        ${buildPreviewHtml(previewImages)}
        <!-- build -->
        ${sectionTitle('Your build')}
          ${rowsTable(build)}
        </td></tr>
        ${extras.length ? `${sectionTitle('Advanced options', 22)}
          <div style="padding-top:12px;font-family:Arial,Helvetica,sans-serif;">${extras.map((x) => `<span style="display:inline-block;margin:0 6px 8px 0;padding:6px 12px;border:1.5px solid #14110f;border-radius:2px;background:#14110f;color:#f4efe6;font-size:12px;font-weight:700;letter-spacing:.02em;">${esc(x)}</span>`).join('')}</div>
        </td></tr>` : ''}
        ${colors.length ? `${sectionTitle('Colors', 22)}
          ${rowsTable(colors.map(([k, v]) => [k, `${dot(v)}&nbsp; ${esc(v)}`]))}
        </td></tr>` : ''}
        ${sectionTitle('Artwork & lettering', 22)}
          ${artwork.length
            ? rowsTable(artwork.map(([place, a]) => [place, `${esc(a.text)}${a.colors.length ? `<div style="margin-top:6px;">${a.colors.map(dot).join('&nbsp;')}</div>` : ''}`]))
            : '<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2a2521;">No lettering, patches or artwork yet. Add a name, letters or your logo in the design lab.</p>'}
        </td></tr>
        <!-- actions -->
        <tr><td class="px" style="padding:28px 36px 32px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#2a2521;">Ready to order? Open it in the design lab and add it to your cart. Questions about sizing or artwork? <strong>Reply to this email</strong> and our team will help.</p>
          ${button(resumeUrl, 'Continue designing', true)}${reviewUrl ? button(reviewUrl, 'Review design', false) : ''}
        </td></tr>
        <!-- footer -->
        <tr><td class="px" style="background:#14110f;padding:22px 36px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:rgba(244,239,230,.6);">
          <strong style="color:#f4efe6;letter-spacing:.14em;">EASY JACKETS</strong><br>
          Custom varsity and letterman jackets for schools, teams, businesses and clubs.<br>
          Questions? <a href="mailto:${esc(supportEmail)}" style="color:#c9a227;text-decoration:none;">${esc(supportEmail)}</a> · <a href="${esc(site)}" style="color:#c9a227;text-decoration:none;">${esc(site.replace(/^https?:\/\//, ''))}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

export const sendFileEmail = async (subject, email, data, location, options = {}) => {
    const settings = await getEmailSettings();

    if (!settings.enabled) {
        console.log(`✉️  Email sending is disabled in admin settings - skipped "${subject}" to ${email}`);
        return { skipped: true };
    }

    // WebP in, PNG out — see helpers/designImages.js for why neither channel
    // can use what the customiser sends.
    const previewImages = await prepareDesignImages(data);

    const html = await ejs.renderFile(__dirname + location, {
        data,
        previews: previewImages.map(({ label, dataUri }) => ({ label, src: dataUri })),
    });

    // The PDF is an attachment, not the payload — the email body already carries
    // the previews, price, materials and fit. PhantomJS is abandonware that is
    // slow on image-heavy designs and can be absent from the image entirely, so
    // losing it must not cost the customer their email.
    let pdfBuffer = null;
    let pdfError = null;
    try {
        pdfBuffer = await generatePDF(html);
    } catch (error) {
        pdfError = error.message;
        console.error("PDF generation failed - sending without the attachment:".yellow, error.message);
        console.error("- Renderer:".yellow, describeRenderer());
    }

    const emailHtml = buildDesignEmailHtml(
        subject,
        data,
        previewImages,
        settings.replyToEmail || settings.adminEmail || settings.fromEmail,
        options.resumeUrl || designStudioUrl(),
        options.reviewUrl || ''
    );

    const mailOptions = {
        from: formatFrom(settings),
        to: email,
        replyTo: options.replyTo || settings.replyToEmail || undefined,
        subject: `${subject}`,
        html: emailHtml,
        attachments: previewImages.map(({ cid, buffer, label }) => ({
            filename: `jacket-${label.toLowerCase()}.png`,
            content: buffer,
            contentType: 'image/png',
            cid,
        })),
    };

    if (pdfBuffer) {
        mailOptions.attachments.push({
            filename: 'custom-jacket-design.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf'
        });
    }

    try {
        console.log("Attempting to send file email...".cyan);

        const transporter = await getTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:".green, info.response);
        return { sent: true, pdfAttached: Boolean(pdfBuffer), pdfError, previews: previewImages.length };
    } catch (error) {
        console.error("CRITICAL EMAIL ERROR (fileEmail):".red);
        console.error("- Message:".yellow, error.message);
        console.error("- Code:".yellow, error.code);
        console.error("- Command:".yellow, error.command);
        console.error("- Response:".yellow, error.response);
        console.error("- Full Error:".grey, JSON.stringify(error, null, 2));
        // Swallowing this reported "shared successfully" to a customer whose
        // email never left the building. The caller decides what to tell them.
        throw error;
    }
};
