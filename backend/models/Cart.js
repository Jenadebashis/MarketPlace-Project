// models/Cart.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      _id: { type: String, required: true }, // Changed to match your JSON key
      name: String,
      price: Number,
      category: String,
      image: String,
      qty: { type: Number, default: 1 },
      vendorId: String,
      sellerName: String,
      specifications: mongoose.Schema.Types.Mixed
    }
  ]
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);