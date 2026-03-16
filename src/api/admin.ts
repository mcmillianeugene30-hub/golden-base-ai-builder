/**
 * Admin API - Manage admin configuration and status
 */

import { Hono } from 'hono';
import { adminService } from '../services/admin';
import { SubscriptionService } from '../services/subscription';

const adminRouter = new Hono();

/**
 * Get admin configuration status
 */
adminRouter.get('/status', (c) => {
  const status = {
    adminConfigured: true,
    adminFid: 1378286,
    adminUsername: 'urbanwarrior79',
    platformWalletAddress: adminService.getPlatformWalletAddress(),
    platformRevenueShare: adminService.getPlatformRevenueShare(),
    creatorRevenueShare: adminService.getCreatorRevenueShare()
  };

  return c.json({ success: true, status });
});

/**
 * Check if a user is admin
 */
adminRouter.get('/check', (c) => {
  const fid = c.req.query('fid');

  if (!fid) {
    return c.json({ success: false, error: 'FID required' }, 400);
  }

  const isAdmin = adminService.isAdminUser(parseInt(fid));
  const hasUnlimited = adminService.hasUnlimitedAccess(parseInt(fid));

  return c.json({
    success: true,
    isAdmin,
    hasUnlimitedAccess: hasUnlimited,
    privileges: hasUnlimited ? {
      freeUnlimitedAccess: true,
      bypassSubscriptionChecks: true,
      bypassCreditChecks: true
    } : null
  });
});

/**
 * Get admin's effective subscription (enterprise/unlimited)
 */
adminRouter.get('/subscription', (c) => {
  const subscription = adminService.getAdminSubscription();
  return c.json({ success: true, subscription });
});

/**
 * Calculate revenue split for a payment amount
 */
adminRouter.post('/revenue-split', async (c) => {
  const { amount } = await c.req.json();

  if (typeof amount !== 'number' || amount < 0) {
    return c.json({ success: false, error: 'Valid amount required' }, 400);
  }

  const split = adminService.calculateRevenueSplit(amount);

  return c.json({
    success: true,
    totalAmount: amount,
    platform: {
      percent: adminService.getPlatformRevenueShare(),
      amount: split.platformShare
    },
    creator: {
      percent: adminService.getCreatorRevenueShare(),
      amount: split.creatorShare
    }
  });
});

export default adminRouter;
