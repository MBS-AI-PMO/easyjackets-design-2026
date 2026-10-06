import mongoose from "mongoose";

// The admin activity ledger: one entry for every change an admin makes (and their sign-ins), in the order
// they happened. Written only by helpers/adminLedger.js, read by routes/adminLogRoutes.js (admin → Activity Log).
//
// Tamper-evident: every entry carries the sha256 of the entry before it (prevHash) and its own (hash, over
// prevHash and the entry's fields), so changing, removing or slipping in an entry outside this code breaks
// the chain, and GET /api/v1/admin-logs/verify says where.
// Append-only: entries are never changed or removed through this model (the hooks below refuse it), and the
// API has no route that would.
//
// `admin` is a copy of who did it (not a reference), so an entry still names its admin after they are renamed
// or deleted. `path` is the route's pattern (/api/v1/product/update-product/:pid), not the address called.
const adminLogSchema = new mongoose.Schema(
  {
    seq: { type: Number, required: true },
    at: { type: Date, required: true },
    admin: {
      _id: { type: mongoose.Schema.Types.ObjectId, default: null },
      name: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    area: { type: String, default: "" },
    action: { type: String, default: "" },
    method: { type: String, default: "" },
    path: { type: String, default: "" },
    target: {
      id: { type: String, default: "" },
      label: { type: String, default: "" },
    },
    // what was sent, with secrets, images and big payloads left out (helpers/adminLedger.js)
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: Number, default: 0 },
    ok: { type: Boolean, default: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    prevHash: { type: String, required: true },
    hash: { type: String, required: true },
  },
  {
    collection: "adminlogs",
    versionKey: false,
    // an empty `details` is stored as {} (not dropped), so the entry read back hashes the same as written
    minimize: false,
  }
);

adminLogSchema.index({ seq: 1 }, { unique: true });
adminLogSchema.index({ at: -1 });
adminLogSchema.index({ "admin._id": 1 });
adminLogSchema.index({ area: 1 });

// Append-only: every way the model offers to change or remove entries fails. (A raw write to the
// collection, outside mongoose, cannot be stopped here; the hash chain shows it instead.)
const APPEND_ONLY = "The admin activity log is append-only: its entries cannot be changed or removed.";
const refuse = function () {
  throw new Error(APPEND_ONLY);
};
const QUERY_WRITES = [
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "findOneAndReplace",
  "replaceOne",
  "deleteOne",
  "deleteMany",
  "findOneAndDelete",
  "findOneAndRemove", // older mongoose; harmless on 8
];
adminLogSchema.pre(QUERY_WRITES, { document: false, query: true }, refuse);
// doc.updateOne() / doc.deleteOne() on an entry that was read
adminLogSchema.pre(["updateOne", "deleteOne"], { document: true, query: false }, refuse);
// saving a document that already exists is an update
adminLogSchema.pre("save", function () {
  if (!this.isNew) throw new Error(APPEND_ONLY);
});
// bulk writes would go around the chain (helpers/adminLedger.js adds entries one by one, in order)
adminLogSchema.pre("bulkWrite", refuse);
adminLogSchema.pre("insertMany", refuse);

export default mongoose.models.AdminLog || mongoose.model("AdminLog", adminLogSchema);
