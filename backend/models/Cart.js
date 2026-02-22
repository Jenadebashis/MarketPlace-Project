// models/Cart.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: String,
      price: Number,
      qty: { type: Number, default: 1 },
      category: String,
      image: String
    }
  ]
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);