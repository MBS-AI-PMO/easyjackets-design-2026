import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import RevokedToken from "../models/revokedToken.js";
import { watchAdminRequest } from "../helpers/adminLedger.js";
import { loginKey } from "../helpers/tokenKeys.js";
import { recordSecurityEvent } from "../helpers/securityEvents.js";

// The sign-in token of a request, decoded, or null. Only this site's sign-in tokens count: they are signed
// with its own sign-in key (helpers/tokenKeys.js), so a design ticket, or a token another backend signed with
// the same JWT_SECRET, is not a login here.
const readToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  const decode = JWT.verify(token, loginKey(), { algorithms: ["HS256"] });
  return decode && typeof decode._id === "string" ? decode : null;
};

// Is the session still on? The account exists, the token is not logged out (models/revokedToken.js), and it
// was signed in after the last password change or reset (the user's tokenVersion; a token from before
// versions existed counts as version 0). A properly signed token that is no longer live is worth recording:
// someone is using a session that was ended (helpers/securityEvents.js).
const sessionIsLive = async (decode, req) => {
  const [user, revoked] = await Promise.all([
    userModel.findById(decode._id).select("_id role email tokenVersion").lean(),
    decode.jti ? RevokedToken.exists({ jti: decode.jti }) : null,
  ]);
  if (!user) return null;
  if (revoked || (decode.v ?? 0) !== (user.tokenVersion ?? 0)) {
    if (req) recordSecurityEvent({ type: "session-revoked-use", req, user, details: { reason: revoked ? "Signed out session" : "Session from before a password change" } });
    return null;
  }
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
    if (!decode || !(await sessionIsLive(decode, req))) {
      return res.status(401).send({ success: false, message: "Invalid or expired token" });
    }
    req.user = decode;
    next();
  } catch (err) {
    // an expired or malformed token is ordinary (an old tab): not logged as an event
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
      recordSecurityEvent({ type: "admin-denied", req, user, details: { route: `${req.method} ${req.baseUrl || ""}${req.route?.path || ""}` } });
      return res.status(401).send({
        success: false,
        message: "Unauthorized access",
      });
    }
    // the admin activity ledger: who is acting, and an entry for this request once it is answered
    // (helpers/adminLedger.js; never throws, never waits)
    req.adminUser = user;
    watchAdminRequest(req, res);
    next();
  } catch (err) {
    console.error("Admin check:", err.message);
    res.status(401).send({
      success: false,
      message: "Error in admin middleware",
    });
  }
};
