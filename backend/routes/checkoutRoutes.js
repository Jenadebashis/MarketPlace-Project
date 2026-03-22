import express from 'express';
import Stripe from 'stripe';
import Cart from '../models/Cart.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-session', async (req, res) => {
  try {
    const { userId } = req.user.id;

    const userCart = await Cart.findOne({ userId });

    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No nature gear found in your cart." 
      });
    }

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

    // 3. Create the Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        userId: userId,
        cartId: userCart._id.toString(), // Store reference to the cart
      },
      line_items,
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Secure Checkout Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Unable to verify your cart and proceed to payment." 
    });
  }
});

export default router;