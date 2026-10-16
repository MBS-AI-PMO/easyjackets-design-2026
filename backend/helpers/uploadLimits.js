import formidable from 'formidable';

// The admin's upload forms (products, categories, gallery, patches, fonts, blog and SEO images): limits on
// what one request may carry. They used to take the library's defaults (200 MB, any number of files), so a
// mistake or a stolen admin session could fill the server's disk. A form's own options still win.
const ADMIN_UPLOAD = {
  maxFileSize: 25 * 1024 * 1024,
  maxTotalFileSize: 250 * 1024 * 1024,
  maxFiles: 60,
  maxFields: 500,
};

export const adminForm = (options = {}) => formidable({ ...ADMIN_UPLOAD, ...options });
