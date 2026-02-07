import dotenv from 'dotenv';
const result = dotenv.config();
if (result.error) {
  console.log("Dotenv Error:", result.error);
}
console.log("Verified Secret:", process.env.JWT_SECRET);
import jwt from 'jsonwebtoken';
import User from '../config/User.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];
      console.log("Secret:", process.env.JWT_SECRET);

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find user and attach to request (excluding password)
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const verifySeller = (req, res, next) => {
  // Now req.user exists because protect ran first!
  if (req.user && req.user.role === 'seller') {
    req.vendorId = req.user.id;
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Only sellers allowed.' });
  }
};