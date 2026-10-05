import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
       type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    image: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 10,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);


const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;