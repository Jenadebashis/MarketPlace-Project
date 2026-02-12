import express from 'express';
import { protect, verifySeller } from '../middleware/auth.js';
import Product from '../models/Product.js';
import User from '../config/User.js';

const router = express.Router();

router.get('/dashboard', protect, verifySeller, async (req, res) => {
  try {
    const id = req.vendorId;
    const user = await User.findOne({ where: { id } });
    const userDetails = {
      name: user.name,
      email: user.email,
      role: user.role
    };
    const query = {};
    query['vendorId'] = id;
    const products = await Product.find(query);
    return res.status(200).json({ userDetails, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
});

router.get('/', async (req, res) => {
  try {
    const { id } = req.query;

    // 1. Validate input exists
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 2. Fetch User
    const user = await User.findOne({ where: { id } });

    // 3. Handle 'Not Found' gracefully
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDetails = {
      name: user.name,
      email: user.email,
      role: user.role
    };

    // 4. Fetch Products
    const products = await Product.find({ vendorId: id });

    return res.status(200).json({ userDetails, products });

  } catch (err) {
    // 5. Avoid sending raw error messages to the client in production
    console.error("Error fetching vendor data:", err);
    res.status(500).json({ message: "An internal error occurred" });
  }
});

export default router;