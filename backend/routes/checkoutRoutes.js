import express from 'express';
import Stripe from 'stripe';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-session', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`[Checkout] Initiating session for User: ${userId}`);

    const userCart = await Cart.findOne({ userId });

    if (!userCart || userCart.items.length === 0) {
      console.warn(`[Checkout] Aborted: Empty cart or user not found for ID: ${userId}`);
      return res.status(400).json({
        success: false,
        message: "No nature gear found in your cart."
      });
    }

    console.log(`[Checkout] Cart found with ${userCart.items.length} items. Mapping line items...`);

    const line_items = userCart.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          description: `${item.category} - Nature Experience Gear`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    console.log(`[Checkout] Creating Stripe session for total items: ${line_items.length}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        userId: userId,
        cartId: userCart._id.toString(),
      },
      line_items,
    });

    console.log(`[Checkout] Session created successfully. Redirecting to: ${session.url}`);
    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Secure Checkout Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to verify your cart and proceed to payment."
    });
  }
});

export default router;