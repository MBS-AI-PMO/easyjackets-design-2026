import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import productReviewModel from "../models/productReviewModel.js";

const REVIEW_STATUSES = ["pending", "approved", "rejected"];

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const clampRating = (value) => {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return null;
  return Math.min(5, Math.max(1, Math.round(rating)));
};

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

const buildReviewSummary = async (productId) => {
  const result = await productReviewModel.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
  ]);

  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatings = 0;
  let weightedTotal = 0;

  result.forEach((item) => {
    const rating = Number(item._id);
    const count = Number(item.count || 0);
    if (ratingBreakdown[rating] != null) {
      ratingBreakdown[rating] = count;
      totalRatings += count;
      weightedTotal += rating * count;
    }
  });

  const averageRating = totalRatings ? Number((weightedTotal / totalRatings).toFixed(1)) : 0;

  return {
    averageRating,
    reviewCount: totalRatings,
    ratingBreakdown,
  };
};

const publicReviewFields = "name rating title comment createdAt";

export const createProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, email, rating, title, comment } = req.body || {};

    if (!isObjectId(productId)) {
      return res.status(400).send({ success: false, message: "Invalid product id" });
    }

    const cleanName = String(name || "").trim();
    const cleanComment = String(comment || "").trim();
    const cleanTitle = String(title || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanRating = clampRating(rating);

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).send({ success: false, message: "Reviewer name is required" });
    }
    if (!cleanComment || cleanComment.length < 5) {
      return res.status(400).send({ success: false, message: "Review comment is required" });
    }
    if (!cleanRating) {
      return res.status(400).send({ success: false, message: "Rating must be between 1 and 5" });
    }

    const product = await productModel.findById(productId).select("_id name slug isActive");
    if (!product) {
      return res.status(404).send({ success: false, message: "Product not found" });
    }

    const review = await productReviewModel.create({
      product: product._id,
      productSlug: product.slug,
      productName: product.name,
      name: cleanName,
      email: cleanEmail,
      rating: cleanRating,
      title: cleanTitle,
      comment: cleanComment,
      status: "pending",
    });

    return res.status(201).send({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating product review:", error);
    return res.status(500).send({
      success: false,
      message: "Error submitting review",
      error: error.message,
    });
  }
};

export const getApprovedProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isObjectId(productId)) {
      return res.status(400).send({ success: false, message: "Invalid product id" });
    }

    const reviews = await productReviewModel
      .find({ product: productId, status: "approved" })
      .select(publicReviewFields)
      .sort({ createdAt: -1 })
      .lean();
    const summary = await buildReviewSummary(productId);

    return res.status(200).send({
      success: true,
      reviews,
      summary,
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

export const getProductReviewSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isObjectId(productId)) {
      return res.status(400).send({ success: false, message: "Invalid product id" });
    }

    const summary = await buildReviewSummary(productId);
    return res.status(200).send({ success: true, summary });
  } catch (error) {
    console.error("Error fetching product review summary:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching review summary",
      error: error.message,
    });
  }
};

export const getAllProductReviews = async (req, res) => {
  try {
    const {
      status = "",
      search = "",
      page = 1,
      limit = 50,
    } = req.query || {};

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const query = {};

    if (status && REVIEW_STATUSES.includes(status)) {
      query.status = status;
    }

    const cleanSearch = String(search || "").trim();
    if (cleanSearch) {
      const regex = new RegExp(escapeRegex(cleanSearch), "i");
      query.$or = [
        { productName: regex },
        { name: regex },
        { email: regex },
        { title: regex },
        { comment: regex },
      ];
    }

    const [reviews, total, statusCounts] = await Promise.all([
      productReviewModel
        .find(query)
        .populate("product", "name slug frontImage")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      productReviewModel.countDocuments(query),
      productReviewModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const counts = { pending: 0, approved: 0, rejected: 0 };
    statusCounts.forEach((item) => {
      if (counts[item._id] != null) counts[item._id] = item.count;
    });

    return res.status(200).send({
      success: true,
      reviews,
      total,
      counts,
      currentPage: pageNum,
      totalPages: Math.max(Math.ceil(total / limitNum), 1),
    });
  } catch (error) {
    console.error("Error fetching admin product reviews:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

export const updateProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      rating,
      title,
      comment,
      status,
      adminNote,
    } = req.body || {};

    if (!isObjectId(id)) {
      return res.status(400).send({ success: false, message: "Invalid review id" });
    }

    const update = {};

    if (name !== undefined) {
      const cleanName = String(name || "").trim();
      if (!cleanName) return res.status(400).send({ success: false, message: "Reviewer name is required" });
      update.name = cleanName;
    }

    if (email !== undefined) update.email = String(email || "").trim().toLowerCase();

    if (rating !== undefined) {
      const cleanRating = clampRating(rating);
      if (!cleanRating) return res.status(400).send({ success: false, message: "Rating must be between 1 and 5" });
      update.rating = cleanRating;
    }

    if (title !== undefined) update.title = String(title || "").trim();

    if (comment !== undefined) {
      const cleanComment = String(comment || "").trim();
      if (!cleanComment) return res.status(400).send({ success: false, message: "Review comment is required" });
      update.comment = cleanComment;
    }

    if (adminNote !== undefined) update.adminNote = String(adminNote || "").trim();

    if (status !== undefined) {
      if (!REVIEW_STATUSES.includes(status)) {
        return res.status(400).send({ success: false, message: "Invalid review status" });
      }
      update.status = status;
      update.approvedAt = status === "approved" ? new Date() : null;
      update.approvedBy = status === "approved" ? req.user?._id : null;
    }

    const review = await productReviewModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate("product", "name slug frontImage");

    if (!review) {
      return res.status(404).send({ success: false, message: "Review not found" });
    }

    return res.status(200).send({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Error updating product review:", error);
    return res.status(500).send({
      success: false,
      message: "Error updating review",
      error: error.message,
    });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).send({ success: false, message: "Invalid review id" });
    }

    const review = await productReviewModel.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).send({ success: false, message: "Review not found" });
    }

    return res.status(200).send({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product review:", error);
    return res.status(500).send({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

// A few of the best approved reviews across the catalogue, for the landing page.
export const getFeaturedReviews = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 3, 1), 12);
    const reviews = await productReviewModel
      .find({ status: "approved", rating: { $gte: 4 }, comment: { $exists: true, $ne: "" } })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 4)
      .select("name rating title comment createdAt product")
      .populate("product", "name slug");
    // prefer reviews with something to say
    const picked = reviews.sort((a, b) => Math.min(b.comment.length, 220) - Math.min(a.comment.length, 220)).slice(0, limit);
    const [stats] = await productReviewModel.aggregate([{ $match: { status: "approved" } }, { $group: { _id: null, total: { $sum: 1 }, avg: { $avg: "$rating" } } }]);
    return res.status(200).send({ success: true, reviews: picked, total: stats?.total || 0, averageRating: stats ? Number(stats.avg.toFixed(1)) : 0 });
  } catch (error) {
    console.error("Error fetching featured reviews:", error);
    return res.status(500).send({ success: false, message: "Error fetching featured reviews" });
  }
};
