import express from "express";
import { protect, verifySeller } from "../middleware/auth.js";
import Product from "../models/Product.js";
import { upload } from "../middleware/upload.js";
import User from "../config/User.js";
import { Op } from "sequelize";
const router = express.Router();
import { productSchema } from "../utils/validation.js";

router.post('/', protect, verifySeller, upload.single('image'), async (req, res) => {
  try {
    const rawData = {
      ...req.body,
      specifications: req.body.specifications ? JSON.parse(req.body.specifications) : undefined
    };

    const validatedData = productSchema.parse(rawData);
    const imageUrl = req.file ? req.file.path : null;

    const product = new Product({
      ...validatedData,
      image: imageUrl,
      vendorId: req.vendorId
    });

    const savedProject = await product.save();
    return res.status(201).json(savedProject);

  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.flatten().fieldErrors
      });
    }
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
});

// GET all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice } = req.query;
    let query = {};

    if (category) query.category = category;
    if (minPrice) query.price = { $gte: Number(minPrice) };

    const products = await Product.find(query);
    const vendorIds = [...new Set(products.map(p => Number(p.vendorId)))];

    const sellers = await User.findAll({
      attributes: ['id', 'name'],
      where: { id: { [Op.in]: vendorIds } },
      raw: true
    });

    const enrichedProducts = products
      .map(product => {
        const seller = sellers.find(s => s.id === Number(product.vendorId));

        if (!seller) return null;

        return {
          ...product._doc,
          sellerName: seller.name
        };
      })
      .filter(product => product !== null); 

    res.json(enrichedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search route
router.get('/search', async (req, res) => {
  try {
    const { name, category, price, minPrice, maxPrice, page = 1, limit = 10, ...extra } = req.query;
    const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (category) query.category = category;

    if (minPrice || maxPrice || price) {
      if (price) {
        query.price = Number(price);
      } else {
        query.price = {};
        if (!isNaN(minPrice)) query.price.$gte = Number(minPrice);
        if (!isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
      }
    }

    Object.keys(extra).forEach((key) => {
      query[`specifications.${key}`] = extra[key];
    });

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const vendorIds = [...new Set(products.map(p => Number(p.vendorId)))];

    const sellers = await User.findAll({
      attributes: ['id', 'name'],
      where: { id: { [Op.in]: vendorIds } },
      raw: true
    });

    const enrichedProducts = products
      .map(product => {
        const seller = sellers.find(s => s.id === Number(product.vendorId));

        if (!seller) return null;

        return {
          ...product._doc,
          sellerName: seller.name
        };
      })
      .filter(product => product !== null);

    res.json(enrichedProducts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;