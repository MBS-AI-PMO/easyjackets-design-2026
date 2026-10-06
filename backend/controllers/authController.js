import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import { sendEmailInBackground } from "../helpers/email.js";
import { storefrontUrl } from "../helpers/customJacketUrl.js";
import crypto from "crypto";
import JWT from "jsonwebtoken";
import RevokedToken from "../models/revokedToken.js";
// the admin activity ledger: sign-ins, sign-outs and password changes of admin accounts (does nothing for others)
import { recordAdminEvent } from "../helpers/adminLedger.js";
// import { compare } from "bcrypt";
const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
});

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }

    const existingUser = await userModel.findOne({ email }); // Corrected syntax
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: `Already registered please login`,
      });
    }
    const hashedPassword = await hashPassword(password);
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user: serializeUser(user), // never the password hash
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: `Error In Registration`,
      error: err,
    });
  }
};

// Admin Registration Controller - Only accessible by existing admins
export const registerAdminController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name) {
      return res.status(400).send({ success: false, message: "Name is Required" });
    }
    if (!email) {
      return res.status(400).send({ success: false, message: "Email is Required" });
    }
    if (!password) {
      return res.status(400).send({ success: false, message: "Password is Required" });
    }
    if (!phone) {
      return res.status(400).send({ success: false, message: "Phone is Required" });
    }
    if (!address) {
      return res.status(400).send({ success: false, message: "Address is Required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: `Email already registered`,
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      role: 1, // Admin role
    }).save();

    res.status(201).send({
      success: true,
      message: "Admin Created Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: `Error In Admin Registration`,
      error: err,
    });
  }
};


// A sign-in token: the user, their tokenVersion (raised by a password change or reset, which ends older
// sessions) and its own id (jti, so logging out can end this one session). 7 days, as before.
const signLoginToken = (user) => JWT.sign(
  { _id: String(user._id), v: user.tokenVersion || 0, jti: crypto.randomBytes(12).toString("hex") },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// After LOCK_AFTER wrong passwords for one account within LOCK_MINUTES, that account's sign-in waits
// LOCK_MINUTES (guessing passwords one after another stops working). Kept in memory.
const LOCK_AFTER = 10;
const LOCK_MINUTES = 15;
const LOCKED_MESSAGE = `Too many wrong passwords. Please wait ${LOCK_MINUTES} minutes, or reset your password.`;
const failedLogins = new Map(); // email -> { count, firstAt, lockedUntil }
const isLockedOut = (key) => (failedLogins.get(key)?.lockedUntil || 0) > Date.now();
const noteFailedLogin = (key) => {
  const now = Date.now();
  const entry = failedLogins.get(key);
  const fresh = !entry || now - entry.firstAt > LOCK_MINUTES * 60 * 1000;
  const next = fresh ? { count: 1, firstAt: now, lockedUntil: 0 } : { ...entry, count: entry.count + 1 };
  if (next.count >= LOCK_AFTER) next.lockedUntil = now + LOCK_MINUTES * 60 * 1000;
  failedLogins.set(key, next);
};
const clearFailedLogins = (key) => failedLogins.delete(key);
setInterval(() => {
  const cutoff = Date.now() - LOCK_MINUTES * 60 * 1000;
  for (const [key, entry] of failedLogins) if (entry.firstAt < cutoff && (entry.lockedUntil || 0) < Date.now()) failedLogins.delete(key);
}, 10 * 60 * 1000).unref();

// Logging out ends this session on the server too (the token stops working at once, not after 7 days).
export const logoutController = async (req, res) => {
  try {
    if (req.user?.jti && req.user?.exp) {
      await RevokedToken.updateOne(
        { jti: req.user.jti },
        { jti: req.user.jti, expiresAt: new Date(req.user.exp * 1000) },
        { upsert: true }
      );
    }
    recordAdminEvent({ userId: req.user?._id, area: "Sign-in", action: "Signed out", req, status: 200 });
    return res.status(200).send({ success: true, message: "Signed out" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ success: false, message: "Something went wrong" });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // text only: an object here (e.g. {"$regex": "^a"}) would be a database query, not an email
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(404).send({
        success: false,
        message: "Invalid email or Password",
      });
    }
    const lockKey = email.trim().toLowerCase();
    if (isLockedOut(lockKey)) {
      recordAdminEvent({ email, area: "Sign-in", action: "Failed sign-in", req, status: 429, details: { reason: "Locked out after too many wrong passwords" } });
      return res.status(429).send({ success: false, message: LOCKED_MESSAGE });
    }

    const user = await userModel.findOne({
      email,
    });

    // one answer for a wrong email and a wrong password, so the form does not tell which emails have accounts
    const match = user ? await comparePassword(password, user.password) : false;
    if (!user || !match) {
      noteFailedLogin(lockKey);
      recordAdminEvent({ user, area: "Sign-in", action: "Failed sign-in", req, status: 200, ok: false, details: { reason: "Wrong password" } });
      return res.status(200).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    clearFailedLogins(lockKey);

    const token = signLoginToken(user);
    recordAdminEvent({ user, area: "Sign-in", action: "Signed in", req, status: 200 });
    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: "Error In Login",
      err,
    });
  }
};

// Password reset by email. Step 1 (forgot-password): the account's email gets a one-time link
// (storefront /account?reset=<token>), valid RESET_MINUTES; only the token's sha256 is stored. The answer is
// the same whether or not the email has an account, so the form does not tell which emails exist.
// Step 2 (reset-password): the token and a new password. (It used to reset any account given a "security
// answer" that was never stored, so any value, or a query operator, matched: anyone could take over any
// account.)
const RESET_MINUTES = 60;
const RESET_SENT = "If an account exists for that email, we have sent a link to reset its password. Check your inbox.";
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

export const forgotPasswordController = async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!email) {
      return res.status(400).send({ success: false, message: "Email is required" });
    }
    const user = await userModel.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await userModel.updateOne(
        { _id: user._id },
        { resetPasswordHash: sha256(token), resetPasswordExpires: new Date(Date.now() + RESET_MINUTES * 60 * 1000) }
      );
      const link = `${storefrontUrl()}/account?reset=${token}`;
      sendEmailInBackground("Reset your Easy Jackets password", user.email, { name: user.name, link, minutes: RESET_MINUTES }, "/views/passwordReset.ejs");
    }
    return res.status(200).send({ success: true, message: RESET_SENT });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ success: false, message: "Something went wrong" });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(400).send({ success: false, message: "This reset link is not valid. Ask for a new one." });
    }
    if (newPassword.length < 6) {
      return res.status(400).send({ success: false, message: "Use a new password of at least 6 characters." });
    }
    const user = await userModel.findOne({ resetPasswordHash: sha256(token), resetPasswordExpires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).send({ success: false, message: "This reset link has expired or was already used. Ask for a new one." });
    }
    // the new password ends every session signed in with the old one
    await userModel.updateOne(
      { _id: user._id },
      { password: await hashPassword(newPassword), resetPasswordHash: null, resetPasswordExpires: null, $inc: { tokenVersion: 1 } }
    );
    clearFailedLogins(String(user.email || "").trim().toLowerCase());
    recordAdminEvent({ user, area: "Account", action: "Reset password", req, status: 200, details: { via: "Emailed reset link" } });
    return res.status(200).send({ success: true, message: "Password changed. Sign in with your new password." });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ success: false, message: "Something went wrong" });
  }
};

export const encryptUser = async (req, res) => {
  try {
    const userId = req.user._id;
    // const { userId } = req.body;

    const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
      notBefore: "0", // Cannot use before now, can be configured to be deferred.
      algorithm: "HS256",
      expiresIn: "24h",
    });

    return res.status(200).send({
      success: true,
      message: "user encrypted",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const testController = (req, res) => {
  try {
    res.send("protected route");
  } catch (err) {
    console.log(err);
    res.send({
      err,
    });
  }
};

export const getAuthenticatedUserController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      ok: true,
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting user profile",
      error,
    });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const normalizedEmail = email?.trim().toLowerCase();

    // a new email or password needs the current password: a stolen session alone must not be able to take
    // the account over (a new email then gets the password reset link)
    const emailChanges = Boolean(normalizedEmail) && normalizedEmail !== String(user.email || '').trim().toLowerCase();
    if (emailChanges || password) {
      const current = typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
      if (!current || !(await comparePassword(current, user.password))) {
        return res.status(401).send({
          success: false,
          message: emailChanges ? "Enter your current password to change your email." : "Enter your current password to change your password.",
        });
      }
    }

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await userModel.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).send({
          success: false,
          message: "Email already registered",
        });
      }
    }

    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name?.trim() || user.name,
        email: normalizedEmail || user.email,
        password: hashedPassword || user.password,
        phone: phone?.trim() || user.phone,
        address: address || user.address,
        // a new password ends every other session; this one gets a fresh token
        ...(hashedPassword ? { $inc: { tokenVersion: 1 } } : {}),
      },
      { new: true }
    );
    recordAdminEvent({ user: updatedUser, area: "Account", action: hashedPassword ? "Changed password" : "Updated profile", req, status: 200, details: req.body });
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      user: serializeUser(updatedUser),
      updatedUser: serializeUser(updatedUser),
      ...(hashedPassword ? { token: signLoginToken(updatedUser) } : {}),
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id, hiddenByUser: { $ne: true } })
      .populate("products")
      .populate("buyer")
      .populate({
        path: 'cartData.id',
        model: 'Products',
        select: 'name frontImage slug'
      })
      .populate({
        path: 'cartData.designId',
        model: 'design',
        select: 'custom_image title'
      })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  }
};

export const userHideOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findOneAndUpdate(
      { _id: orderId, buyer: req.user._id },
      { hiddenByUser: true },
      { new: true }
    );

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found or not authorized",
      });
    }

    res.status(200).send({
      success: true,
      message: "Order hidden from history",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while hiding order",
      error,
    });
  }
};
//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products")
      .populate("buyer", "-password")
      .sort({ createdAt: "descending" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Query the database with pagination
    const allUsers = await userModel.find({ role: 0 }).select('-password').skip(skip).limit(limit);
    const totalUsers = await userModel.countDocuments();
    res.json({ allUsers, totalUsers });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting All Users",
      error,
    });
  }
};

// Get All Admins (role: 1)
export const getAllAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Query the database for admins only (role: 1)
    const allAdmins = await userModel.find({ role: 1 }).select('-password').skip(skip).limit(limit);
    const totalAdmins = await userModel.countDocuments({ role: 1 });

    res.json({
      success: true,
      allAdmins,
      totalAdmins,
      currentPage: page,
      totalPages: Math.ceil(totalAdmins / limit)
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting All Admins",
      error,
    });
  }
};

// Delete Admin (protected - only admins can delete)
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Admin ID is required",
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    // Only allow deleting admin users (role: 1)
    if (user.role !== 1) {
      return res.status(400).send({
        success: false,
        message: "This user is not an admin",
      });
    }

    await userModel.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting admin",
      error,
    });
  }
};

// Change Password Controller - For logged-in users
export const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword) {
      return res.status(400).send({
        success: false,
        message: "Current password is required",
      });
    }
    if (!newPassword) {
      return res.status(400).send({
        success: false,
        message: "New password is required",
      });
    }
    if (!confirmPassword) {
      return res.status(400).send({
        success: false,
        message: "Please confirm your new password",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        success: false,
        message: "New password and confirmation do not match",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).send({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Get current user from req.user (set by requireSignin middleware)
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password and update; every other session ends, this one gets a fresh token (`token`)
    const hashedPassword = await hashPassword(newPassword);
    const updated = await userModel.findByIdAndUpdate(
      req.user._id,
      { password: hashedPassword, $inc: { tokenVersion: 1 } },
      { new: true }
    );

    recordAdminEvent({ user: updated, area: "Account", action: "Changed password", req, status: 200 });
    res.status(200).send({
      success: true,
      token: signLoginToken(updated),
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error changing password",
      error,
    });
  }
};
