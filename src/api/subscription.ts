/**
 * Subscription API - Manage user subscriptions
 */

import { Hono } from 'hono';
import { SubscriptionService } from '../services/subscription';
import { StripeService } from '../services/payments/stripe';
import { AIService } from '../services/ai';
import { getDb } from '../lib/db';

const subscriptionRouter = new Hono();

subscriptionRouter.get('/tier', (c) => {
  const tiers = SubscriptionService.getAvailableTiers();
  return c.json({ success: true, tiers });
});

subscriptionRouter.get('/tier/:tier', (c) => {
  const tier = c.req.param('tier');
  const tierInfo = SubscriptionService.getTierDetails(tier);

  if (!tierInfo) {
    return c.json({ success: false, error: 'Tier not found' }, 404);
  }

  return c.json({ success: true, tier: tierInfo });
});

subscriptionRouter.get('/current', async (c) => {
  const fid = c.req.query('fid');

  if (!fid) {
    return c.json({ success: false, error: 'FID required' }, 400);
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  const subscriptionService = new SubscriptionService();
  const subscription = await subscriptionService.getUserSubscription(user.id);
  const creditBalance = await subscriptionService.getCreditBalance(user.id);

  const aiService = new AIService(creditBalance.balance, subscription?.tier || 'starter');
  const availableModels = aiService.getAvailableModels();

  return c.json({
    success: true,
    subscription,
    creditBalance,
    availableModels
  });
});

subscriptionRouter.post('/subscribe', async (c) => {
  try {
    const { fid, tier, email } = await c.req.json();

    if (!fid || !tier) {
      return c.json({ success: false, error: 'FID and tier required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const stripeService = new StripeService();
    const checkout = await stripeService.createSubscriptionCheckout(user.id, tier, email);

    return c.json({
      success: true,
      checkoutUrl: checkout.url,
      sessionId: checkout.sessionId
    });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

subscriptionRouter.post('/cancel', async (c) => {
  try {
    const { fid } = await c.req.json();

    if (!fid) {
      return c.json({ success: false, error: 'FID required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const subscriptionService = new SubscriptionService();
    await subscriptionService.cancelSubscription(user.id);

    return c.json({ success: true, message: 'Subscription canceled' });
  } catch (error: any) {
    console.error('Cancel error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

subscriptionRouter.post('/webhook', async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const payload = await c.req.text();

    if (!signature) {
      return c.json({ success: false, error: 'Stripe signature required' }, 400);
    }

    const stripeService = new StripeService();
    await stripeService.handleWebhook(signature, payload);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default subscriptionRouter;
