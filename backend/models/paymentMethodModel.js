import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        stripePaymentMethodId: {
            type: String,
            required: true,
            unique: true
        },
        type: {
            type: String,
            enum: ["card", "bank_account"],
            required: true
        },
        // Card-specific fields (masked/safe data only)
        card: {
            brand: String,      // visa, mastercard, amex, etc.
            last4: String,      // Last 4 digits only
            expMonth: Number,
            expYear: Number
        },
        // Bank account fields (masked/safe data only)
        bankAccount: {
            bankName: String,
            last4: String
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Ensure only one default payment method per user
paymentMethodSchema.index({ user: 1, isDefault: 1 });

export default mongoose.model("PaymentMethod", paymentMethodSchema);
