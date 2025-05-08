import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); // Use service role key for write access

console.log(process.env.STRIPE_WEBHOOK_SECRET);

app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    console.log('Received Stripe webhook:', req.headers, req.body);

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_email;

    // Update Supabase
    await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('email', customerEmail);
  }

  res.json({ received: true });
});

app.use(express.json({ type: 'application/json' }));

const PORT = process.env.PORT || 4243;
app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`));