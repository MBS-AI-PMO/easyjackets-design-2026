import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
export const requireSignin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ success: false, message: "No token provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    console.error('❌ Auth Middleware Error:', err.message);
    res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

//Admin Access

export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized access",
      });
    } else {
      next();
    }
  } catch (err) {
    res.status(401).send({
      success: false,
      err,
      message: "Error in admin middleware",
    });
    console.log(err);
  }
};
