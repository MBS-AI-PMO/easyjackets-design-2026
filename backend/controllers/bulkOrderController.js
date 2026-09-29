import formidable from "formidable";
import BulkOrder from "../models/bulkorder.js";
import uploadToS3, { getPublicFileUrl } from "../helpers/fileUpload.js";
import { sendEmail } from "../helpers/email.js";
import { getAdminEmail } from "../helpers/emailSettings.js";

const getFirstField = (fields, key, fallback = '') => {
  const value = fields?.[key];
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
};

const getUploadedFiles = (files, key) => {
  const value = files?.[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const createBulkOrder = async (req, res) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: 'Error parsing the files.',
      });
    }

    try {
      const additionalImageFiles = getUploadedFiles(files, 'images');
      const additionalImageUrls = [];

      for (const file of additionalImageFiles) {
        const url = await uploadToS3(file);
        additionalImageUrls.push(getPublicFileUrl(url, req));
      }

      const data = {
        name: getFirstField(fields, 'name'),
        email: getFirstField(fields, 'email').trim().toLowerCase(),
        phone: getFirstField(fields, 'phone'),
        country: getFirstField(fields, 'country'),
        selectedProduct: getFirstField(fields, 'selectedProduct'),
        zipoutLining: getFirstField(fields, 'zipoutLining') === "true",
        flapClosure: getFirstField(fields, 'flapClosure') === "true",
        selectedClosure: getFirstField(fields, 'selectedClosure'),
        selectedLining: getFirstField(fields, 'selectedLining'),
        message: getFirstField(fields, 'message'),
        quantity: Number(getFirstField(fields, 'quantity', 10)),
        designLocations: JSON.parse(getFirstField(fields, 'designLocations', '{}')),
        images: additionalImageUrls,
        // the 2026 quote form's extra answers (plain text, kept short)
        organization: String(getFirstField(fields, 'organization')).trim().slice(0, 160),
        orderType: String(getFirstField(fields, 'orderType')).trim().slice(0, 60),
        quantityRange: String(getFirstField(fields, 'quantityRange')).trim().slice(0, 30),
        neededBy: String(getFirstField(fields, 'neededBy')).trim().slice(0, 30),
        budget: String(getFirstField(fields, 'budget')).trim().slice(0, 60),
      };

      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return res.status(400).send({
          success: false,
          message: 'A valid email is required.',
        });
      }

      if (!data.selectedProduct || !data.quantity || data.quantity < 10) {
        return res.status(400).send({
          success: false,
          message: 'Product and minimum quantity are required.',
        });
      }

      const saved = await BulkOrder.create(data);

      // Carry the saved record's identity into the notification so the admin copy shows
      // the same submission time and reference the dashboard does.
      const emailData = { ...data, createdAt: saved.createdAt, referenceId: saved._id, siteUrl: (process.env.CLIENT_URL || '').replace(/\/+$/, '') };

      const adminRecipient = await getAdminEmail();
      const emailResults = await Promise.allSettled([
        sendEmail(
          `New bulk quote: ${data.organization || data.name} · ${data.quantityRange || data.quantity} × ${data.selectedProduct}`,
          adminRecipient,
          emailData,
          '/views/bulkOrderAdmin.ejs',
          { replyTo: data.email }
        ),
        sendEmail(
          'Your Easy Jackets bulk quote request is in',
          data.email,
          emailData,
          '/views/bulkOrderCustomer.ejs'
        ),
      ]);

      const [adminEmail, customerEmail] = emailResults;

      // The request is already saved at this point, so a failed notification must not
      // be reported as a failed submission - the customer would resubmit and we'd
      // end up with duplicate leads for an order we already have.
      if (adminEmail.status === 'rejected') {
        console.error('Bulk order admin email failed:', adminEmail.reason);
      }
      if (customerEmail.status === 'rejected') {
        console.error('Bulk order customer email failed:', customerEmail.reason);
      }

      return res.status(200).json({
        success: true,
        message: "bulk order created successfully",
        emailStatus: {
          admin: adminEmail.status === 'fulfilled' ? 'sent' : 'failed',
          customer: customerEmail.status === 'fulfilled' ? 'sent' : 'failed',
        },
      });
    }
    catch (error) {
      res.status(500).send({
        success: false,
        message: "Error in creating bulk order",
        error: error.message,
      });
    }
  })
}

export const getAllbulkOrderController = async (req, res) => {
  try {
    const { page, limit } = req.query

    let filter = { isDeleted: { $ne: true } };

    //   if (category) {
    //     filter.status = status;
    //   }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 8, 1);

    const bulkorders = await BulkOrder.find(filter).skip((pageNumber - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 });
    const totalOrders = await BulkOrder.countDocuments(filter);
    res.status(200).send({
      success: true,
      totalPages: Math.ceil(totalOrders / pageSize) || 1,
      bulkorders,
      totalOrders,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting bulk order",
      error: error.message,
    });
  }
};

export const getSingleOrderController = async (req, res) => {
  try {
    const bulkorder = await BulkOrder
      .findOne({ _id: req.params.id, isDeleted: { $ne: true } })

    res.status(200).send({
      success: true,
      message: "Single Order Fetched",
      bulkorder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

export const getDeletedBulkOrderController = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const filter = { isDeleted: true };

    const bulkorders = await BulkOrder.find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ deletedAt: -1, updatedAt: -1 });
    const totalOrders = await BulkOrder.countDocuments(filter);

    res.status(200).send({
      success: true,
      message: "Deleted bulk order list",
      bulkorders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / pageSize) || 1,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting deleted bulk orders",
      error: error.message,
    });
  }
};

export const softDeleteBulkOrderController = async (req, res) => {
  try {
    const bulkorder = await BulkOrder.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!bulkorder) {
      return res.status(404).send({
        success: false,
        message: "Bulk order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Bulk order moved to Deleted Orders",
      bulkorder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error moving bulk order to Deleted Orders",
      error: error.message,
    });
  }
};

export const restoreBulkOrderController = async (req, res) => {
  try {
    const bulkorder = await BulkOrder.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!bulkorder) {
      return res.status(404).send({
        success: false,
        message: "Bulk order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Bulk order restored successfully",
      bulkorder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error restoring bulk order",
      error: error.message,
    });
  }
};

export const permanentDeleteBulkOrderController = async (req, res) => {
  try {
    const bulkorder = await BulkOrder.findByIdAndDelete(req.params.id);

    if (!bulkorder) {
      return res.status(404).send({
        success: false,
        message: "Bulk order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Bulk order deleted permanently",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error deleting bulk order permanently",
      error: error.message,
    });
  }
};
