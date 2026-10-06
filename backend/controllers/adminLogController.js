import mongoose from "mongoose";
import AdminLog from "../models/adminLog.js";
import userModel from "../models/userModel.js";
import { GENESIS_HASH, hashEntry, ledgerHead } from "../helpers/adminLedger.js";

// Admin → Activity Log: reading the admin activity ledger (models/adminLog.js, written by helpers/adminLedger.js).
// Read only: there is deliberately no route that changes or removes an entry.

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_SEARCH = 100;
const MAX_EXPORT = 20000;
const FAILED_SIGN_IN = "Failed sign-in";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const oneText = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// A date from the query; a bare day ("2026-10-06") as `to` means the end of that day (UTC).
const readDate = (value, endOfDay = false) => {
  const raw = oneText(value, 40);
  if (!raw) return null;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) && endOfDay ? `${raw}T23:59:59.999Z` : raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

// The filter for ?admin=&area=&action=&ok=&from=&to=&q= (the list and the CSV export share it).
const buildFilter = (query = {}) => {
  const filter = {};
  const admin = oneText(query.admin, 24);
  if (admin && mongoose.isValidObjectId(admin)) filter["admin._id"] = new mongoose.Types.ObjectId(admin);
  const area = oneText(query.area, 60);
  if (area) filter.area = area;
  const action = oneText(query.action, 120);
  if (action) filter.action = action;
  if (query.ok === "true") filter.ok = true;
  else if (query.ok === "false") filter.ok = false;
  const from = readDate(query.from);
  const to = readDate(query.to, true);
  if (from || to) filter.at = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  const search = oneText(query.q, MAX_SEARCH);
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { action: pattern },
      { "target.label": pattern },
      { "target.id": pattern },
      { path: pattern },
      { "admin.email": pattern },
      { "admin.name": pattern },
    ];
  }
  return filter;
};

// GET /api/v1/admin-logs — newest first, a page at a time
export const listAdminLogs = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const [entries, total] = await Promise.all([
      AdminLog.find(filter).sort({ seq: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AdminLog.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, entries, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (error) {
    console.error("Admin log list:", error);
    res.status(500).json({ success: false, message: "Could not load the activity log" });
  }
};

// GET /api/v1/admin-logs/admins — one line per admin: everyone in the log plus every current admin
export const adminLogSummary = async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [fromLog, currentAdmins] = await Promise.all([
      AdminLog.aggregate([
        { $sort: { seq: -1 } },
        {
          $group: {
            _id: "$admin._id",
            name: { $first: "$admin.name" },
            email: { $first: "$admin.email" },
            total: { $sum: 1 },
            lastAt: { $max: "$at" },
            failedSignIns: {
              $sum: { $cond: [{ $and: [{ $eq: ["$action", FAILED_SIGN_IN] }, { $gte: ["$at", since] }] }, 1, 0] },
            },
          },
        },
      ]),
      userModel.find({ role: 1 }).select("name email").lean(),
    ]);

    // who is still an admin now (a deleted or demoted account shows as removed)
    const current = new Map(currentAdmins.map((u) => [String(u._id), u]));

    const admins = fromLog
      .filter((row) => row._id)
      .map((row) => {
        const id = String(row._id);
        const now = current.get(id);
        return {
          _id: id,
          name: now?.name || row.name || "",
          email: now?.email || row.email || "",
          total: row.total,
          lastAt: row.lastAt,
          failedSignIns: row.failedSignIns,
          isAdmin: Boolean(now),
        };
      });
    for (const [id, user] of current) {
      if (!admins.some((a) => a._id === id)) {
        admins.push({ _id: id, name: user.name || "", email: user.email || "", total: 0, lastAt: null, failedSignIns: 0, isAdmin: true });
      }
    }
    admins.sort((a, b) => (b.isAdmin - a.isAdmin) || (new Date(b.lastAt || 0) - new Date(a.lastAt || 0)) || a.name.localeCompare(b.name));
    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error("Admin log summary:", error);
    res.status(500).json({ success: false, message: "Could not load the admins" });
  }
};

// GET /api/v1/admin-logs/areas — for the area filter
export const adminLogAreas = async (req, res) => {
  try {
    const areas = (await AdminLog.distinct("area")).filter(Boolean).sort((a, b) => a.localeCompare(b));
    res.status(200).json({ success: true, areas });
  } catch (error) {
    console.error("Admin log areas:", error);
    res.status(500).json({ success: false, message: "Could not load the areas" });
  }
};

// GET /api/v1/admin-logs/verify — walks the whole chain in order (a batch at a time, never all in memory) and
// says whether every entry is there, links to the one before and still has the contents it was written with.
export const verifyAdminLogs = async (req, res) => {
  try {
    // entries this process wrote before the walk began must all be found, the last one unchanged
    const known = ledgerHead();
    let expected = 1;
    let prevHash = GENESIS_HASH;
    let problem = null; // { brokenAt, reason }
    // leaving the loop early closes the cursor
    for await (const entry of AdminLog.find({}).sort({ seq: 1 }).lean().cursor({ batchSize: 500 })) {
      if (entry.seq !== expected) {
        problem = entry.seq > expected
          ? { brokenAt: expected, reason: `Entry #${expected} is missing` }
          : { brokenAt: entry.seq, reason: `Entry #${entry.seq} is out of order` };
      } else if (entry.prevHash !== prevHash) {
        problem = { brokenAt: entry.seq, reason: `Entry #${entry.seq} does not link to the entry before it (prevHash mismatch)` };
      } else if (hashEntry(entry) !== entry.hash) {
        problem = { brokenAt: entry.seq, reason: `Entry #${entry.seq} was changed after it was written (hash mismatch)` };
      } else if (known && entry.seq === known.seq && entry.hash !== known.hash) {
        problem = { brokenAt: entry.seq, reason: `Entry #${entry.seq} is not the entry that was written (the chain was rewritten)` };
      }
      if (problem) break;
      prevHash = entry.hash;
      expected += 1;
    }
    const count = expected - 1;
    if (!problem && known && known.seq > count) {
      problem = { brokenAt: count + 1, reason: `Entries after #${count} are missing (the newest written was #${known.seq})` };
    }
    if (problem) return res.status(200).json({ success: true, intact: false, ...problem, count });
    res.status(200).json({ success: true, intact: true, count });
  } catch (error) {
    console.error("Admin log verify:", error);
    res.status(500).json({ success: false, message: "Could not check the activity log" });
  }
};

// CSV: one value per cell, quoted; a value that a spreadsheet would run as a formula starts with '
const csvCell = (value) => {
  let cell = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(cell)) cell = `'${cell}`;
  return `"${cell.replace(/"/g, '""')}"`;
};
const waitForDrain = (res) => new Promise((resolve) => {
  const done = () => {
    res.off("drain", done);
    res.off("close", done);
    resolve();
  };
  res.on("drain", done);
  res.on("close", done);
});
const CSV_HEADER = ["#", "Date (UTC)", "Admin", "Admin email", "Area", "Action", "Item", "Item id", "Result", "Status", "Method", "Route", "IP", "Browser", "Details", "Hash"];

// GET /api/v1/admin-logs/export.csv — the same filters as the list, newest first, at most MAX_EXPORT rows
export const exportAdminLogs = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="admin-activity-${day}.csv"`);
    res.setHeader("Cache-Control", "no-store");
    res.write(`﻿${CSV_HEADER.map(csvCell).join(",")}\r\n`);
    const cursor = AdminLog.find(filter).sort({ seq: -1 }).limit(MAX_EXPORT).lean().cursor({ batchSize: 500 });
    for await (const e of cursor) {
      const line = [
        e.seq,
        e.at ? new Date(e.at).toISOString() : "",
        e.admin?.name,
        e.admin?.email,
        e.area,
        e.action,
        e.target?.label,
        e.target?.id,
        e.ok ? "Succeeded" : "Failed",
        e.status,
        e.method,
        e.path,
        e.ip,
        e.userAgent,
        e.details && Object.keys(e.details).length ? JSON.stringify(e.details) : "",
        e.hash,
      ].map(csvCell).join(",");
      // a slow download pauses the database reads instead of piling rows up in memory; a closed one stops them
      if (!res.write(`${line}\r\n`)) await waitForDrain(res);
      if (res.destroyed) break;
    }
    res.end();
  } catch (error) {
    console.error("Admin log export:", error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Could not export the activity log" });
    else res.end();
  }
};
