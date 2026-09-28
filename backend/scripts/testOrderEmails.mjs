/**
 * scripts/testOrderEmails.mjs
 *
 * Sends the real order-confirmation email — the customer copy and the shop
 * owner copy — for a real order, without placing one.
 *
 * Why not just place a test order: every checkout path writes a live row to the
 * orders collection, takes a real payment unless it is COD, and mails the real
 * customer on the order. This exercises exactly the same code (the same
 * `sendEmail`, the same views/orderInvoice.ejs, the same SMTP settings from the
 * admin panel, the same `getAdminEmail()` recipient) against an order that is
 * already there, and sends nothing to the customer unless you ask it to.
 *
 * The admin panel's own "send test email" only proves the mailbox logs in. This
 * proves the invoice template renders with real order data and that both
 * recipients receive it — which is what actually breaks.
 *
 * Run it wherever the API runs — Coolify -> Easyjackets api -> Terminal:
 *
 *   node scripts/testOrderEmails.mjs --customer=you@example.com
 *       Customer copy to that address, owner copy to the shop's configured
 *       admin address. This is the one that answers "do both arrive".
 *
 *   node scripts/testOrderEmails.mjs --customer=you@example.com --owner=me@example.com
 *       Both copies redirected, so the shop owner's real mailbox stays quiet.
 *
 *   ... --order=EJ-6F8U3XBP62662     pick an order by orderId or _id
 *   ... --dry                        render only, send nothing
 *
 *   node scripts/testOrderEmails.mjs --live --i-mean-it
 *       The real thing: customer copy to the real buyer on that order. This
 *       emails an actual customer, which is why it needs saying twice.
 */
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import 'dotenv/config';
import mongoose from 'mongoose';

const args = process.argv.slice(2);
const has = (flag) => args.some((a) => a === flag || a.startsWith(`${flag}=`));
const valueOf = (flag) => {
  const found = args.find((a) => a.startsWith(`${flag}=`));
  return found ? found.slice(flag.length + 1) : '';
};

// --to is kept as an alias for --customer so either reads naturally.
const CUSTOMER_TO = (valueOf('--customer') || valueOf('--to')).trim();
const OWNER_TO = valueOf('--owner').trim();
const ORDER = valueOf('--order').trim();
const DRY = has('--dry');
const LIVE = has('--live');
const CONFIRMED = has('--i-mean-it');

if (!DRY && !CUSTOMER_TO && !LIVE) {
  console.error('Give it an address for the customer copy:  --customer=you@example.com');
  console.error('Or --dry to only render, or --live to mail the real buyer.');
  process.exit(1);
}
if (LIVE && !CONFIRMED) {
  console.error('--live mails the real customer on that order. Add --i-mean-it if that is what you want.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URL);

const { default: orderModel } = await import('../models/orderModel.js');
const { sendEmail } = await import('../helpers/email.js');
const { getAdminEmail, getEmailSettings } = await import('../helpers/emailSettings.js');

const finish = async (code = 0) => {
  await mongoose.disconnect();
  process.exit(code);
};

// ── the order ────────────────────────────────────────────────────────────────
const query = ORDER
  ? { $or: [{ orderId: ORDER }, ...(mongoose.isValidObjectId(ORDER) ? [{ _id: new mongoose.Types.ObjectId(ORDER) }] : [])] }
  : {};

const order = await orderModel.findOne(query).sort({ createdAt: -1 });

if (!order) {
  console.error(ORDER ? `No order matches "${ORDER}".` : 'There are no orders to send.');
  await finish(1);
}

// Same shape the checkout controllers hand to sendEmail.
const data = {
  ...order.toObject(),
  clientUrl: process.env.CLIENT_URL || 'https://easyjackets.com',
};

const buyerEmail = order.shipping_details?.[0]?.email
  || order.billing_Details?.[0]?.email
  || order.buyer?.email
  || '';

const settings = await getEmailSettings({ fresh: true });
const adminEmail = await getAdminEmail();

console.log(`\nOrder      #${order.orderId}  (${order._id})`);
console.log(`Placed     ${order.createdAt?.toISOString?.() || '-'}`);
console.log(`Items      ${order.totalItems}   Total ${order.totalAmount} ${order.currency || ''}`);
console.log(`Buyer      ${buyerEmail || '(no address on the order)'}`);
console.log(`\nSMTP       ${settings.smtpHost}:${settings.smtpPort}  as ${settings.smtpUser}`);
console.log(`From       ${settings.fromName ? `${settings.fromName} <${settings.fromEmail}>` : settings.fromEmail}`);
console.log(`Admin      ${adminEmail || '(not configured)'}`);
console.log(`Sending    ${settings.enabled ? 'enabled' : 'DISABLED in the admin panel — nothing will go out'}`);

// Who each copy goes to. The owner copy defaults to the address the shop is
// actually configured to notify — that is the half most worth proving.
const customerTo = LIVE ? buyerEmail : CUSTOMER_TO;
const ownerTo = OWNER_TO || adminEmail;

if (!DRY) {
  if (!customerTo) {
    console.error('\nNo customer recipient. That order has no email address on it.');
    await finish(1);
  }
  if (!ownerTo) {
    console.error('\nNo owner recipient. Set the admin email in the admin panel first.');
    await finish(1);
  }
}

// ── render ───────────────────────────────────────────────────────────────────
const path = await import('node:path');
const { fileURLToPath } = await import('node:url');
const ejs = (await import('ejs')).default;
const viewsDir = path.dirname(fileURLToPath(new URL('../helpers/email.js', import.meta.url)));

let html;
try {
  html = await ejs.renderFile(path.join(viewsDir, '/views/orderInvoice.ejs'), { data });
} catch (error) {
  console.error('\n❌ The invoice template failed to render — no email would have been sent either.');
  console.error(`   ${error.message}`);
  await finish(1);
}
console.log(`\nTemplate   orderInvoice.ejs rendered, ${Math.round(html.length / 1024)} KB`);

if (DRY) {
  console.log(`\nDry run. Nothing sent.`);
  console.log(`  customer copy would go to  ${customerTo || '(--customer not given)'}`);
  console.log(`  owner copy would go to     ${ownerTo || '(no admin email configured)'}`);
  await finish();
}

// ── send ─────────────────────────────────────────────────────────────────────
const attempt = async (label, subject, to) => {
  process.stdout.write(`\n${label} -> ${to}\n`);
  try {
    const result = await sendEmail(subject, to, data, '/views/orderInvoice.ejs');
    if (result?.skipped) {
      console.log('   SKIPPED — email sending is turned off in the admin panel.');
      return false;
    }
    console.log(`   sent. id ${result?.messageId || '-'}`);
    if (result?.accepted?.length) console.log(`   accepted: ${result.accepted.join(', ')}`);
    if (result?.rejected?.length) console.log(`   REJECTED: ${result.rejected.join(', ')}`);
    return !result?.rejected?.length;
  } catch (error) {
    console.log(`   FAILED: ${error.message}`);
    return false;
  }
};

const customerOk = await attempt('Customer copy', `Order Confirmation - #${order.orderId}`, customerTo);
const ownerOk = await attempt('Shop owner copy', `New Order Received - #${order.orderId}`, ownerTo);

console.log(`\n${'-'.repeat(60)}`);
console.log(`Customer copy   ${customerOk ? 'OK' : 'FAILED'}`);
console.log(`Shop owner copy ${ownerOk ? 'OK' : 'FAILED'}`);
console.log('Check the inbox — accepted by the server is not the same as delivered.');
await finish(customerOk && ownerOk ? 0 : 1);
