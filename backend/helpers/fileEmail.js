import pdf from 'html-pdf';
import fs from 'fs';
import { createRequire } from 'module';
import { getTransporter, getEmailSettings, formatFrom } from './emailSettings.js';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs'
import { prepareDesignImages } from './designImages.js';
import { designStudioUrl } from './customJacketUrl.js';

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

const buildPreviewHtml = (previewImages = []) => {
    if (!previewImages.length) return '';

    return `
                            <p style="margin: 0 0 8px; color: #211d18; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;">Design Preview</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 28px;">
                                ${[0, 2].map(start => {
                                    const row = previewImages.slice(start, start + 2);
                                    if (!row.length) return '';

                                    return `
                                <tr>
                                    ${row.map(item => `
                                    <td class="preview-cell" width="50%" style="width: 50%; padding: 8px; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fffaf2; border: 1px solid #eadfce; border-radius: 14px;">
                                            <tr>
                                                <td style="padding: 16px; text-align: center;">
                                                    <img src="cid:${item.cid}" alt="${item.label} jacket view" style="display: block; width: 100%; max-width: 230px; height: auto; margin: 0 auto;">
                                                    <div style="margin-top: 10px; color: #8a7c6d; font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;">${item.label} View</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    `).join('')}
                                    ${row.length === 1 ? '<td class="preview-cell" width="50%" style="width: 50%; padding: 8px;"></td>' : ''}
                                </tr>`;
                                }).join('')}
                            </table>`;
};

const buildDesignEmailHtml = (subject, data, previewImages, supportEmail = 'info@easyjackets.com', resumeUrl = designStudioUrl()) => {
    const previewHtml = buildPreviewHtml(previewImages);
    const greeting = data.shareName ? `Hi ${data.shareName}, ` : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        @media only screen and (max-width: 620px) {
            .outer-pad { padding: 18px 10px !important; }
            .email-card { width: 100% !important; max-width: 100% !important; border-radius: 14px !important; }
            .hero, .content, .footer { padding-left: 22px !important; padding-right: 22px !important; }
            .hero-title { font-size: 31px !important; }
            .preview-cell, .summary-cell { display: block !important; width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
            .summary-cell + .summary-cell { padding-top: 10px !important; }
            .cta { display: block !important; text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #ffffff; color: #211d18;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
        <tr>
            <td class="outer-pad" style="padding: 30px 12px;">
                <table class="email-card" role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="width: 640px; max-width: 640px; margin: 0 auto; background-color: #fffaf2; border: 1px solid #e4d6c3; border-radius: 18px; overflow: hidden; box-shadow: 0 18px 50px rgba(33, 29, 24, 0.10);">
                    <tr>
                        <td class="hero" style="background: #11100e; padding: 38px 34px 34px; color: #f5eee3;">
                            <p style="margin: 0 0 14px; color: #c4703a; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;">Easy Jackets Design Studio</p>
                            <h1 class="hero-title" style="margin: 0; color: #f5eee3; font-family: Georgia, 'Times New Roman', serif; font-size: 38px; line-height: 1.02; font-weight: 400; letter-spacing: -.03em;">Your custom jacket design is ready.</h1>
                            <p style="margin: 16px 0 0; color: rgba(245,238,227,.72); font-size: 15px; line-height: 1.7; max-width: 500px;">
                                ${greeting}we saved a polished preview of your configuration. The full specification is attached as a PDF for review.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="content" style="padding: 34px;">
                            <p style="margin: 0 0 18px; color: #5f574c; font-size: 15px; line-height: 1.75;">
                                Thanks for designing with <strong style="color: #211d18;">Easy Jackets</strong>. Your jacket preview and selected details are below, with the complete technical file attached.
                            </p>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0; background: #f1e6d7; border: 1px solid #e2d2bd; border-radius: 14px;">
                                <tr>
                                    <td style="padding: 22px; text-align: center;">
                                        <p style="margin: 0 0 8px; color: #8a7c6d; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;">Estimated Total</p>
                                        <p style="margin: 0; color: #c4703a; font-family: Georgia, 'Times New Roman', serif; font-size: 42px; line-height: 1; font-weight: 400;">$${data.custom_price || '0.00'}</p>
                                    </td>
                                </tr>
                            </table>

                            ${previewHtml}

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 28px;">
                                <tr>
                                    <td class="summary-cell" width="50%" style="width: 50%; padding: 0 8px 0 0; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border: 1px solid #eadfce; border-radius: 14px;">
                                            <tr>
                                                <td style="padding: 18px;">
                                                    <p style="margin: 0 0 12px; color: #c4703a; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;">Materials</p>
                                                    <p style="margin: 0 0 8px; color: #5f574c; font-size: 14px; line-height: 1.55;"><strong style="color:#211d18;">Body:</strong> ${data.materials?.body || 'N/A'}</p>
                                                    <p style="margin: 0; color: #5f574c; font-size: 14px; line-height: 1.55;"><strong style="color:#211d18;">Sleeves:</strong> ${data.materials?.sleeves || 'N/A'}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td class="summary-cell" width="50%" style="width: 50%; padding: 0 0 0 8px; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border: 1px solid #eadfce; border-radius: 14px;">
                                            <tr>
                                                <td style="padding: 18px;">
                                                    <p style="margin: 0 0 12px; color: #c4703a; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;">Fit</p>
                                                    <p style="margin: 0 0 8px; color: #5f574c; font-size: 14px; line-height: 1.55;"><strong style="color:#211d18;">Size:</strong> ${data.sizes?.size || 'N/A'}</p>
                                                    <p style="margin: 0; color: #5f574c; font-size: 14px; line-height: 1.55;"><strong style="color:#211d18;">Scale:</strong> ${data.sizes?.scale || 'N/A'}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 24px; color: #5f574c; font-size: 15px; line-height: 1.75;">
                                Please review the attached PDF before ordering. Not quite there yet? Pick up exactly where you left off &mdash; the button below reopens this jacket in the studio with every choice still in place.
                            </p>

                            <a href="${resumeUrl}" class="cta" style="display: inline-block; background: #c4703a; color: #ffffff; text-decoration: none; padding: 15px 24px; border-radius: 999px; font-size: 13px; font-weight: 700; letter-spacing: .04em;">Continue Designing</a>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer" style="background: #11100e; color: rgba(245,238,227,.56); padding: 24px 34px; font-size: 12px; line-height: 1.7;">
                            <strong style="color:#f5eee3;">Easy Jackets</strong><br>
                            Custom varsity jackets, patches, embroidery, and team orders.<br>
                            <p style="margin: 12px 0 0; color: rgba(245,238,227,.56); font-size: 12px; line-height: 1.7;">
                                Questions? Email <a href="mailto:${supportEmail}" style="color: #c4703a; text-decoration: none;">${supportEmail}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
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
        options.resumeUrl || designStudioUrl()
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
