/**
 * Payment API - Handle credit purchases
 */

import { Hono } from 'hono';
import { CreditService } from '../services/payments/credits';
import { getDb } from '../lib/db';

const paymentRouter = new Hono();

paymentRouter.get('/packages', (c) => {
  const creditService = new CreditService();
  const packages = creditService.getCreditPackages();
  return c.json({ success: true, packages });
});

paymentRouter.get('/methods', (c) => {
  return c.json({
    success: true,
    methods: [
      { id: 'stripe', name: 'Credit Card', icon: '💳', supported: true },
      { id: 'crypto', name: 'Crypto (ETH/USDC)', icon: '🪙', supported: true },
      { id: 'frame', name: 'Farcaster Frame', icon: '🖼️', supported: true }
    ]
  });
});

paymentRouter.post('/purchase', async (c) => {
  try {
    const { fid, credits, method, currency, email } = await c.req.json();

    if (!fid || !credits || !method) {
      return c.json({ success: false, error: 'FID, credits, and method required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const creditService = new CreditService();
    const result = await creditService.purchaseCredits(user.id, credits, method, {
      currency,
      userEmail: email
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

paymentRouter.post('/verify', async (c) => {
  try {
    const { fid, txHash, method } = await c.req.json();

    if (!fid || !txHash || !method) {
      return c.json({ success: false, error: 'FID, txHash, and method required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const creditService = new CreditService();
    const result = await creditService.verifyPayment(user.id, txHash, method);

    return c.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Verify error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

paymentRouter.get('/balance', async (c) => {
  const fid = c.req.query('fid');

  if (!fid) {
    return c.json({ success: false, error: 'FID required' }, 400);
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  const creditService = new CreditService();
  const balance = await creditService.getBalance(user.id);
  const transactions = await creditService.getTransactionHistory(user.id);

  return c.json({
    success: true,
    balance,
    transactions
  });
});

export default paymentRouter;
