import braintree from "braintree";
import dotenv from "dotenv";
import path from "path";

// Loaded before server.mjs reads its .env, so read it here too (a no-op where there is no file).
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Braintree is optional: checkout runs on Stripe. The gateway is created only when all three
// keys are set. Without them the API still starts and the two Braintree routes answer 503;
// the Braintree library throws on missing keys, which used to stop the whole backend booting.
const { BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY } = process.env;

const gateway = BRAINTREE_MERCHANT_ID && BRAINTREE_PUBLIC_KEY && BRAINTREE_PRIVATE_KEY
  ? new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId: BRAINTREE_MERCHANT_ID,
      publicKey: BRAINTREE_PUBLIC_KEY,
      privateKey: BRAINTREE_PRIVATE_KEY,
    })
  : null;

console.log(gateway ? "Braintree: configured" : "Braintree: not configured (no keys), its payment routes are off");

export default gateway;
