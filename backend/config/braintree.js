import braintree from "braintree";
import dotenv from "dotenv";
import path from "path";

// 1. Force explicit path to the .env file in the main folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 2. DEBUG: Print what we found (Check your terminal for this!)
console.log("---------------- DEBUG CHECK ----------------");
console.log("📂 Current Folder:", process.cwd());
console.log("🔑 Public Key:", process.env.BRAINTREE_PUBLIC_KEY ? "✅ FOUND" : "❌ MISSING / UNDEFINED");
console.log("---------------------------------------------");

// 3. Create Gateway
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export default gateway;