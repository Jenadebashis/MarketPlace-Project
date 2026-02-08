import 'dotenv/config';
import express from "express";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import sequelize from './config/db.js'
import User from './config/User.js';
import jwt from 'jsonwebtoken';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { globalErrorHandler } from './middleware/globalErrorHandler.js';
import { registrationSchema } from './utils/validation.js';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// 1. UTILITY: Catch-all for async errors (Replaces try/catch)
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next); 
};

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
app.use(express.json());
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  origin: 'https://marketplace-project-xi5v.onrender.com/'
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_CONNECTION)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.use('/api/product', productRoutes);
app.use('/api/user', userRoutes);

// --- UPDATED ROUTES USING catchAsync ---

app.get('/db-test', catchAsync(async (req, res) => {
  const [results] = await sequelize.query('SELECT NOW()');
  res.json({ message: "Connected!", time: results[0] });
}));

app.post('/api/auth/register', catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const rawData = {
    ...req.body,
  };


  const validatedData = registrationSchema.parse(rawData);
  console.log('the rawdata is: ', rawData, validatedData);

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    ...validatedData,
    password: hashedPassword,
  });

  res.status(201).json({
    message: "User Registered Successfully...",
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}));

app.post('/api/auth/login', catchAsync(async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: "user not found!" });

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(401).json({ error: "Invalid Password!!!" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'strong_secret',
    { expiresIn: '2h' }
  );

  res.json({
    message: "User Login Successful",
    token,
    user: { id: user.id, name: user.name, role: user.role },
  });
}));

// --- 2. GLOBAL ERROR HANDLER (MUST BE AFTER ROUTES) ---

app.use(globalErrorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});