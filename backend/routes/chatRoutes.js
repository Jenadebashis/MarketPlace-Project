import express from 'express';
import { Message, Conversation } from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Inbox (All conversations for the logged-in user)
router.get('/inbox', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name email')
      .populate('productId', 'name price image')
      .lean()
      .sort({ lastTimestamp: -1 });

    // Format for frontend
    const formattedInbox = conversations.map(conv => {
      const otherParty = conv.participants.find(p => p._id.toString() !== req.user.id);
      return {
        roomId: conv.roomId,
        otherPartyName: otherParty?.name || "User",
        lastMessage: conv.lastMessage,
        timestamp: conv.lastTimestamp,
        product: conv.productId
      };
    });

    res.json(formattedInbox);
  } catch (err) {
    res.status(500).json({ message: "Server Error fetching inbox" });
  }
});

// 2. Get Chat History (Previous messages for a specific room)
router.get('/history/:roomId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .lean()
      .sort({ timestamp: 1 })
      .limit(100);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error loading history" });
  }
});

export default router;