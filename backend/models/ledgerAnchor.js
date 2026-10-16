import mongoose from 'mongoose';

// Where signing started in the admin activity ledger (helpers/adminLedger.js): the first entry signed with
// the ledger key. Itself signed (mac), so it cannot be moved or removed without the check noticing: every
// entry from firstSignedSeq on must carry a valid signature. One record, _id "adminlog".
const ledgerAnchorSchema = new mongoose.Schema(
  {
    _id: { type: String },
    firstSignedSeq: { type: Number, required: true },
    mac: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: 'ledgeranchors' }
);

export default mongoose.models.LedgerAnchor || mongoose.model('LedgerAnchor', ledgerAnchorSchema);
