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
router.post('/sync', protect, async (req, res) => {
  const { items } = req.body;
  try {
    // Upsert: Find by userId, update items, create if not found
    let cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: items } },
      { new: true, upsert: true }
    );
    res.json(cart.items);
  } catch (err) {
    res.status(500).send('Error syncing cart');
  }
});

export default router;