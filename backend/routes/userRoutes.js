import express from 'express';
import { protect, verifySeller } from '../middleware/auth.js';
import Product from '../models/Product.js';
import User from '../config/User.js';

const router = express.Router();

router.get('/dashboard', protect, verifySeller, async(req, res) => {
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
    return res.status(200).json({userDetails, products});
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
});

export default router;