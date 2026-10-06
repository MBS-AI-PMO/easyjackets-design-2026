import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import RevokedToken from "../models/revokedToken.js";
import { watchAdminRequest } from "../helpers/adminLedger.js";

// The sign-in token of a request, decoded, or null. A sign-in token carries the user's _id; other tokens
// signed with the same secret (e.g. /auth/encrypt's { userId }, design tickets) are not logins.
const readToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  const decode = JWT.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  return decode && typeof decode._id === "string" ? decode : null;
};

// Is the session still on? The account exists, the token is not logged out (models/revokedToken.js), and it
// was signed in after the last password change or reset (the user's tokenVersion; a token from before
// versions existed counts as version 0).
const sessionIsLive = async (decode) => {
  const [user, revoked] = await Promise.all([
    userModel.findById(decode._id).select("_id role email tokenVersion").lean(),
    decode.jti ? RevokedToken.exists({ jti: decode.jti }) : null,
  ]);
  if (!user || revoked) return null;
  if ((decode.v ?? 0) !== (user.tokenVersion ?? 0)) return null;
  return user;
};

/** For routes open to guests: the signed-in user ({ _id, role, email }) when the request carries a live login, else null. */
export const readSignedInUser = async (req) => {
  try {
    const decode = readToken(req);
    if (!decode) return null;
    return await sessionIsLive(decode);
  } catch {
    return null;
  }
};

export const requireSignin = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({ success: false, message: "No token provided" });
    }
    const decode = readToken(req);
    if (!decode || !(await sessionIsLive(decode))) {
      return res.status(401).send({ success: false, message: "Invalid or expired token" });
    }
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
      // the admin activity ledger: who is acting, and an entry for this request once it is answered
      // (helpers/adminLedger.js; never throws, never waits)
      req.adminUser = user;
      watchAdminRequest(req, res);
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
