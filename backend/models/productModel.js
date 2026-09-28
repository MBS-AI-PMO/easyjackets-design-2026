import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    standardPrice: {
      type: Number,
      default: 0
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    material: {
      body: {
        type: String
      },
      sleeves: {
        type: String
      }
    },
    color: {
      type: mongoose.ObjectId,
      ref: "color",
    },

    description: {
      type: String,

    },
    careInstructions: {
      type: String,
      default: '',
    },
    metaTitle: {
      type: String,
      default: ''
    },
    metaDescription: {
      type: String,
      default: ''
    },
    // Target keywords for this product page, comma separated. Read by SEO Health
    // to check the meta title and description actually mention what the page
    // should rank for; falls back to a derived guess when empty.
    metaKeywords: {
      type: String,
      default: ''
    },
    // Dedicated 1200x630 social share card. Separate from frontImage because the
    // product photo is square and cropped badly by link previews; empty means
    // fall back to frontImage.
    ogImage: {
      type: String,
      default: ''
    },
    // Set from SEO Health → Index Control. Keeps the product page out of the
    // product sitemap and makes the storefront render a noindex robots tag.
    noIndex: {
      type: Boolean,
      default: false
    },
    shortdescription: {
      type: String,

    },
    imageAlt: {
      type: String,
    },
    frontImage: {
      type: String, // File path or URL of the front image

    },
    otherImages: [
      {
        type: String, // File paths or URLs for additional images
        default: []
      },
    ],
    sizes: [
      {
        size: {
          type: String,

        },
        price: {
          type: Number,
        },
      },
    ],
    designId: {
      type: mongoose.ObjectId,
      ref: 'design',
    },
    sku: {
      type: String
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",

    },

    isActive: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);
