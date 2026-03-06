import 'dotenv/config';
import express from "express";
import { createServer } from 'http'; // 1. Added
import { Server } from 'socket.io';  // 2. Added
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import sequelize from './config/db.js'
import User from './config/User.js';
import jwt from 'jsonwebtoken';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { globalErrorHandler } from './middleware/globalErrorHandler.js';
import { registrationSchema } from './utils/validation.js';
import { Conversation, Message } from './models/Message.js';

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
const httpServer = createServer(app); // 3. Wrap express app
app.use(express.json());
const allowedOrigins = [
  'https://marketplacedj.netlify.app',
  'http://localhost:5173',                      // Your local React app
  'https://marketplace-project-xi5v.onrender.com' // Your deployed app (no trailing slash)
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Important if you are using cookies/sessions later
}));

// Express v5 compliant preflight handler
app.options('/*splat', cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_CONNECTION)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.use('/api/product', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/chat', chatRoutes);

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

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET || 'strong_secret', (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  const buyerId = socket.user.id;
  socket.join(`user_${buyerId}`);

  socket.on('add_to_cart', (product) => {
    // 1. Identify the seller from the incoming data
    const sellerId = product.vendorId;

    // 2. Send the notification to the SELLER'S room
    io.to(`user_${sellerId}`).emit('notification', {
      type: 'NEW_SALE_INTEREST',
      message: `A customer just added ${product.name} to their cart!`,
      buyerId: buyerId,
      timestamp: new Date()
    });

    // Optional: Still notify the buyer that it worked
    socket.emit('notification', {
      type: 'SUCCESS',
      message: 'Added to your cart'
    });
  });

  socket.on('join_chat', ({ roomId }) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // 2. Message is sent ONLY to that room
  socket.on('send_message', async (data) => {
    const { roomId, text, productId, sellerId } = data;
    console.log('--- Debugging Message Error ---');
    console.log('User ID from Socket:', socket.user.id);
    console.log('Type of User ID:', typeof socket.user.id);

    try {
      // 1. Save the individual message
      const newMessage = await Message.create({
        roomId,
        senderId: socket.user.id,
        text
      });
      console.log('✅ Message saved to DB');

      // 2. Update (or Create) the Conversation for the Inbox
      const updatedConversation = await Conversation.findOneAndUpdate(
        { roomId },
        {
          lastMessage: text,
          lastTimestamp: new Date(),
          $addToSet: { participants: { $each: [socket.user.id, Number(sellerId)] } },
          productId: productId,
          // 💡 This is the key: Increment the count by 1 for every new message
          $inc: { unreadCount: 1 }
        },
        { upsert: true, new: true }
      );

      console.log('✅ Conversation updated');

      const clients = io.sockets.adapter.rooms.get(roomId);
      console.log(`Sending to ${clients ? clients.size : 0} users in room ${roomId}`);

      io.to(roomId).emit('receive_message', newMessage);
      io.emit('update_unread_count', {
        roomId,
        newCount: updatedConversation.unreadCount
      });

    } catch (err) {
      console.error('❌ SERVER ERROR:', err.message);
      // Send error to frontend so you know why it failed
      socket.emit('error_message', { error: err.message });
    }
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

// --- 2. GLOBAL ERROR HANDLER (MUST BE AFTER ROUTES) ---

app.use(globalErrorHandler);

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server & WebSockets running on port ${PORT}`);
});