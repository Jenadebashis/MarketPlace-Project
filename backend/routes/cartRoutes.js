// routes/cart.js
import express from "express";
const router = express.Router();
import Cart from "../models/Cart.js";
import { protect } from "../middleware/auth.js";

// GET /api/cart - Fetch user's cart on login
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(cart ? cart.items : []);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST /api/cart/sync - Save Redux cart to Database
router.post('/sync', auth, async (req, res) => {
  try {
    const { items } = req.body;
    console.log("User ID from token:", req.user.id);
    
    let cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: items } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(cart.items);
  } catch (err) {
    console.error("Mongoose Error:", err.message);
    res.status(500).send(err.message);
  }
});

export default router;