import express from 'express';
import { Message, Conversation } from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/inbox', protect, async (req, res) => {
  try {
    // req.user.id is likely a string from the token, convert to Number for the query
    const currentUserId = Number(req.user.id);

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      // You can still populate productId if it's a real MongoDB ObjectId
      .populate('productId', 'name price image')
      .lean()
      .sort({ lastTimestamp: -1 });

    const formattedInbox = conversations.map(conv => {
      // Find the ID that is NOT the current user
      const otherPartyId = conv.participants.find(p => Number(p) !== currentUserId);

      return {
        roomId: conv.roomId,
        otherPartyId: otherPartyId, // Useful for the frontend .find logic
        otherPartyName: `User ${otherPartyId}`, // Temporary until you fetch user names
        lastMessage: conv.lastMessage,
        timestamp: conv.lastTimestamp,
        product: conv.productId || { name: "Product", image: "" }
      };
    });

    res.json(formattedInbox);
  } catch (err) {
    console.error("Inbox Error:", err);
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

router.put('/read/:roomId', protect, async (req, res) => {
  await Conversation.findOneAndUpdate(
    { roomId: req.params.roomId },
    { unreadCount: 0 }
  );
  res.status(200).json({ success: true });
});

export default router;