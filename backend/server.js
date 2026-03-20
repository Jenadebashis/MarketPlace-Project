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

sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ Postgres Tables Synced (User, etc.)");
  })
  .catch((err) => {
    console.error("❌ Postgres Sync Error:", err);
  });

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
  // 🔌 Connection Event
  console.log(`\n--- 🔌 NEW CONNECTION ---`);
  console.log(`Socket ID: ${socket.id}`);
  console.log(`User ID: ${socket.user.id}`);

  const buyerId = socket.user.id;
  socket.join(`user_${buyerId}`);
  console.log(`📢 User ${buyerId} joined their private notification room: user_${buyerId}`);

  // 🛒 Add to Cart Event
  socket.on('add_to_cart', (product) => {
    console.log(`\n--- 🛒 ADD TO CART EVENT ---`);
    console.log(`Buyer: ${buyerId}`);
    console.log(`Product: ${product.name} (ID: ${product.id || 'N/A'})`);

    const sellerId = product.vendorId;
    console.log(`Target Seller ID: ${sellerId}`);

    // Notify the Seller
    io.to(`user_${sellerId}`).emit('notification', {
      type: 'NEW_SALE_INTEREST',
      message: `A customer just added ${product.name} to their cart!`,
      buyerId: buyerId,
      timestamp: new Date()
    });
    console.log(`✉️ Notification sent to seller room: user_${sellerId}`);

    // Notify the Buyer
    socket.emit('notification', {
      type: 'SUCCESS',
      message: 'Added to your cart'
    });
    console.log(`✅ Success confirmation sent back to buyer`);
  });

  // 🚪 Join Chat Event
  socket.on('join_chat', ({ roomId }) => {
    socket.join(roomId);
    console.log(`\n--- 🚪 ROOM JOIN ---`);
    console.log(`User ${socket.user.id} entered room: ${roomId}`);
  });

  // 💬 Send Message Event
  socket.on('send_message', async (data) => {
    const { roomId, text, productId, sellerId } = data;

    console.log(`\n--- 💬 MESSAGE RECEIVED ---`);
    console.log(`From: ${socket.user.id} | Room: ${roomId}`);
    console.log(`Content: "${text}"`);

    try {
      // 1. Save Message to DB
      const newMessage = await Message.create({
        roomId,
        senderId: socket.user.id,
        text
      });
      console.log(`💾 Message saved to database. ID: ${newMessage._id}`);

      // 2. Update Conversation Metadata
      const updatedConversation = await Conversation.findOneAndUpdate(
        { roomId },
        {
          lastMessage: text,
          lastTimestamp: new Date(),
          $addToSet: { participants: { $each: [socket.user.id, Number(sellerId)] } },
          productId: productId,
          $inc: { unreadCount: 1 }
        },
        { upsert: true, new: true }
      ).populate('productId');

      console.log(`🔄 Conversation ${roomId} updated/upserted in DB`);

      // 3. Broadcast to the Chat Room
      io.to(roomId).emit('receive_message', newMessage);
      console.log(`📡 Message broadcasted to all users in room: ${roomId}`);

      // 4. Update Inboxes for Participants
      updatedConversation.participants.forEach((participantId) => {
        if (participantId.toString() === socket.user.id.toString()) {
          console.log(`⏭️ Skipping inbox update for sender (${participantId})`);
          return;
        }

        io.to(`user_${participantId}`).emit('inbox_update', {
          type: 'NEW_OR_UPDATE_CONVERSATION',
          conversation: updatedConversation,
          unreadCount: updatedConversation.unreadCount
        });
        console.log(`📬 Sent inbox_update to user_${participantId}`);
      });

      console.log(`✅ Finished processing message for room ${roomId}`);

    } catch (err) {
      console.error(`\n❌ SERVER ERROR in 'send_message':`);
      console.error(err.stack); // stack trace is better for debugging
      socket.emit('error_message', { error: 'Failed to send message' });
    }
  });

  // 📉 Disconnect Event
  socket.on('disconnect', () => {
    console.log(`\n--- 📉 DISCONNECTED ---`);
    console.log(`User ID: ${socket.user.id} | Socket: ${socket.id}`);
  });
});

// --- 2. GLOBAL ERROR HANDLER (MUST BE AFTER ROUTES) ---

app.use(globalErrorHandler);

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server & WebSockets running on port ${PORT}`);
});