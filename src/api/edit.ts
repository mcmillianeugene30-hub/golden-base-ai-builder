/**
 * Edit API - Updated to use free AI APIs with credit system
 */

import { Hono } from 'hono';
import { AIService } from '../services/ai';
import { SubscriptionService } from '../services/subscription';
import { getDb } from '../lib/db';

const editRouter = new Hono();

editRouter.post('/', async (c) => {
  try {
    const { fid, appId, code, change, model = 'auto' } = await c.req.json();

    if (!fid || !code || !change) {
      return c.json({ success: false, error: 'FID, code, and change required' }, 400);
    }

    // Get user
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(fid) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Get user's subscription and credits
    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.getUserSubscription(user.id);
    const creditBalance = await subscriptionService.getCreditBalance(user.id);

    // Create AI service
    const aiService = new AIService(creditBalance.balance, subscription?.tier || 'starter');

    // Generate edit
    const result = await aiService.generateApp('', { code, change, model });

    // Deduct credits (edit is half cost)
    const cost = model === 'gpt-4' || model === 'claude-3-opus' ? 150 : 25;
    await subscriptionService.deductCredits(user.id, cost, `App edit (${model})`);

    // Update app in database
    if (appId) {
      db.prepare('UPDATE apps SET code = ?, updated_at = datetime("now") WHERE app_id = ?')
        .run(result.code, appId);
    }

    return c.json({
      success: true,
      code: result.code,
      response: result.response,
      creditsRemaining: creditBalance.balance - cost
    });
  } catch (error: any) {
    console.error('Edit error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default editRouter;
