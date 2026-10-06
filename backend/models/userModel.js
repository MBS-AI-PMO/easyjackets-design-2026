import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: {},
      required: true
    },
    role: {
      type: Number,
      default: 0,
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    cart: [{
      type: mongoose.ObjectId,
      ref: 'cart'
    }],
    // password reset (controllers/authController.js): the sha256 of the emailed one-time token, and when it
    // stops working; never sent to any client
    resetPasswordHash: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    // part of every sign-in token: raised when the password changes or is reset, which ends every
    // session signed in before (middlewares/authMiddleware.js)
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
