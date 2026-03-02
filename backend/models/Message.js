import mongoose from 'mongoose';

// Individual Message Schema
const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Conversation/Inbox Schema
const conversationSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  lastMessage: { type: String },
  lastTimestamp: { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 }
}, { timestamps: true });

// Exporting as named constants
export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);