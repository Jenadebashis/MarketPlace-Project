import express from 'express';
import Stripe from 'stripe';
import Cart from '../models/Cart.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
s
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const userId = session.metadata.userId;

    try {
      console.log(`Payment successful for user: ${userId}`);
      
      await Cart.findOneAndUpdate(
        { userId: userId },
        { $set: { items: [] } }
      );
    } catch (dbErr) {
      console.error("Database Update Error:", dbErr.message);
      return res.status(500).json({ error: "Order fulfillment failed" });
    }
  }

  res.status(200).json({ received: true });
});

export default router;