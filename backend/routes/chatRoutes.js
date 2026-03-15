import express from 'express';
import { Message, Conversation } from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import User from '../config/User.js';

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

    const vendorIds = [...new Set(
      conversations.flatMap(conv =>
        conv.participants.map(p => Number(p)).filter(id => id !== currentUserId)
      )
    )];

    const sellers = await User.findAll({
      attributes: ['id', 'name'],
      where: { id: { [Op.in]: vendorIds } },
      raw: true
    });

    const sellerMap = Object.fromEntries(sellers.map(s => [s.id, s.name]));

    const formattedInbox = conversations.map(conv => {
      const otherPartyId = conv.participants.find(p => Number(p) !== currentUserId);

      return {
        roomId: conv.roomId,
        otherPartyId,
        otherPartyName: sellerMap[otherPartyId] || `User - ${otherPartyId}`,
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