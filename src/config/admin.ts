/**
 * Admin Configuration
 * Platform-wide admin user settings and wallet configuration
 */

export const ADMIN_CONFIG = {
  // Admin user identification
  fid: 1378286,
  username: 'urbanwarrior79',

  // Admin privileges
  freeUnlimitedAccess: true, // Unlimited app creation and deployment
  bypassSubscriptionChecks: true,
  bypassCreditChecks: true,

  // Platform wallet for collecting all payments (Stripe, Crypto, Frames)
  platformWalletAddress: '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3' as `0x${string}`,

  // Revenue sharing (platform takes 40%, creator/developer gets 60%)
  platformRevenueSharePercent: 40,
  creatorRevenueSharePercent: 60,
} as const;

export type AdminConfig = typeof ADMIN_CONFIG;
