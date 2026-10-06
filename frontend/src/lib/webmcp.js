// WebMCP (https://developer.chrome.com/docs/ai/webmcp): lets an AI agent in the visitor's browser use
// the site. Forms carry `toolname` / `tooldescription` (and `toolparamdescription` on their fields), so
// the browser offers them to the agent as tools it can fill in; components/AgentTools.jsx registers the
// rest (lib/agentTools.js). Browsers without WebMCP ignore all of it.

/**
 * A form an agent filled in and sent (SubmitEvent.agentInvoked): the values, read from the form
 * itself, and `reply(result)` to hand the agent the outcome. null for an ordinary submit. Call it in
 * the submit handler before anything is awaited: the browser only accepts the answer while the
 * submit event is running, and every path must then call reply() once.
 */
export function agentSubmission(e) {
  const native = e?.nativeEvent;
  if (!native?.agentInvoked || typeof native.respondWith !== 'function' || !e.currentTarget) return null;
  let answer = () => {};
  native.respondWith(new Promise((resolve) => { answer = resolve; }));
  return { values: Object.fromEntries(new FormData(e.currentTarget)), reply: (result) => answer(result) };
}

/** An order's status for an agent (lib/orders.js normalizeOrder): the stage and the parcel, no address or payment. */
export const orderStatusSummary = (o) => ({
  order_number: o.orderId,
  status: o.statusLabel,
  placed_on: o.dateLabel,
  courier: o.courier,
  tracking_number: o.trackingNumber,
  tracking_url: o.trackingUrl || null,
  shipped_on: o.shippedLabel || null,
  delivered_on: o.deliveredLabel || null,
  note: o.shippingNote || null,
  updates: o.history.map((h) => ({ when: h.when, status: h.label, note: h.note || undefined })),
  items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, size: i.size || undefined, color: i.color || undefined })),
});
