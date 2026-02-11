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
    // 1. Prepare the data for validation
    // We parse specifications first because Zod expects an object, not a string.
    const rawData = {
      ...req.body,
      specifications: req.body.specifications ? JSON.parse(req.body.specifications) : undefined
    };
    console.log('the specifications coming here is: ', req.body.specifications, rawData.specifications);

    // 2. Validate with Zod
    const validatedData = productSchema.parse(rawData);

    // 3. Handle File Logic
    const imageUrl = req.file ? req.file.path : null;

    // 4. Save to Database using validatedData
    const product = new Product({
      ...validatedData, // Contains name, description, price, category, specifications
      image: imageUrl,
      vendorId: req.vendorId
    });

    const savedProject = await product.save();
    return res.status(201).json(savedProject);

  } catch (err) {
    // 5. Handle Zod Errors specifically
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
      where: {
        id: {
          [Op.in]: vendorIds
        }
      },
      raw: true
    });


    const enrichedProducts = products.map(product => {
      const seller = sellers.find(s => s.id === Number(product.vendorId));
      return {
        ...product._doc,
        sellerName: seller ? seller.name : 'Unknown Seller'
      };
    });

    res.json(enrichedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


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
      where: {
        id: {
          [Op.in]: vendorIds
        }
      },
      raw: true
    });


    const enrichedProducts = products.map(product => {
      const seller = sellers.find(s => s.id === Number(product.vendorId));
      return {
        ...product._doc,
        sellerName: seller ? seller.name : 'Unknown Seller'
      };
    });

    res.json(enrichedProducts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;