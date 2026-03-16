/**
 * Subscription Service - Manage user subscriptions and tiers
 */

import type { Subscription, CreditBalance } from '../types/subscription';
import { getDb } from '../../lib/db';
import { adminService } from '../admin';

export interface SubscriptionTier {
  name: string;
  price: number;
  creditsPerMonth: number;
  maxApps: number;
  features: string[];
  aiModels: string[];
  connectorLimit: number;
}

export const TIERS: Record<string, SubscriptionTier> = {
  starter: {
    name: 'Starter',
    price: 1.99,
    creditsPerMonth: 500,
    maxApps: 3,
    features: [
      'Free AI generation (Groq, OpenRouter)',
      '3 apps per month',
      'Basic templates',
      'Community support'
    ],
    aiModels: ['groq', 'openrouter'],
    connectorLimit: 5
  },
  growth: {
    name: 'Growth',
    price: 4.99,
    creditsPerMonth: 2000,
    maxApps: 10,
    features: [
      'All AI models (including GPT-4)',
      '10 apps per month',
      'All templates',
      'Email support',
      'Priority generation'
    ],
    aiModels: ['groq', 'openrouter', 'gpt-4'],
    connectorLimit: 15
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    creditsPerMonth: 5000,
    maxApps: 25,
    features: [
      'All AI models (including Claude)',
      '25 apps per month',
      'All templates + premium',
      'Priority support',
      'API access',
      'Custom branding'
    ],
    aiModels: ['groq', 'openrouter', 'gpt-4', 'claude-3-opus'],
    connectorLimit: 50
  },
  enterprise: {
    name: 'Enterprise',
    price: 29.99,
    creditsPerMonth: 15000,
    maxApps: 100,
    features: [
      'All AI models with priority',
      '100 apps per month',
      'Unlimited everything',
      'Dedicated support',
      'Advanced analytics',
      'White-label option',
      'Custom connectors'
    ],
    aiModels: ['groq', 'openrouter', 'gpt-4', 'claude-3-opus'],
    connectorLimit: -1 // unlimited
  }
};

export class SubscriptionService {
  private db = getDb();

  /**
   * Get or create user subscription
   */
  async getUserSubscription(userId: number, fid?: number): Promise<Subscription | null> {
    // Check if user is admin with unlimited access
    if (fid && adminService.hasUnlimitedAccess(fid)) {
      return adminService.getAdminSubscription();
    }

    const stmt = this.db.prepare(`
      SELECT * FROM subscriptions
      WHERE user_id = ? AND status IN ('active', 'past_due')
      ORDER BY started_at DESC
      LIMIT 1
    `);

    const row = stmt.get(userId) as any;

    if (!row) {
      // Create free starter tier
      return this.createFreeSubscription(userId);
    }

    return this.mapRowToSubscription(row);
  }

  /**
   * Create free starter subscription
   */
  private createFreeSubscription(userId: number): Subscription {
    const stmt = this.db.prepare(`
      INSERT INTO subscriptions (user_id, tier, status, credits_per_month)
      VALUES (?, 'starter', 'active', ?)
    `);

    const result = stmt.run(userId, TIERS.starter.creditsPerMonth);

    return {
      id: result.lastInsertRowid as number,
      userId,
      tier: 'starter',
      status: 'active',
      creditsPerMonth: TIERS.starter.creditsPerMonth,
      startedAt: new Date().toISOString(),
      endsAt: null
    };
  }

  /**
   * Get user's credit balance
   */
  async getCreditBalance(userId: number): Promise<CreditBalance> {
    const subscription = await this.getUserSubscription(userId);

    // Calculate remaining credits
    const purchasesStmt = this.db.prepare(`
      SELECT SUM(amount) as total
      FROM credit_transactions
      WHERE user_id = ? AND type IN ('purchase', 'bonus', 'subscription')
    `);

    const usageStmt = this.db.prepare(`
      SELECT SUM(amount) as total
      FROM credit_transactions
      WHERE user_id = ? AND type = 'usage'
    `);

    const purchases = purchasesStmt.get(userId) as any;
    const usage = usageStmt.get(userId) as any;

    const totalPurchased = purchases.total || 0;
    const totalUsed = Math.abs(usage.total || 0);
    const remaining = totalPurchased - totalUsed;

    // Add monthly credits if subscription is active
    let monthlyCredits = 0;
    if (subscription && subscription.status === 'active') {
      monthlyCredits = subscription.creditsPerMonth;
    }

    return {
      userId,
      balance: remaining,
      monthlyCredits,
      totalPurchased,
      totalUsed,
      tier: subscription?.tier || 'starter'
    };
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    userId: number,
    amount: number,
    type: 'purchase' | 'bonus' | 'subscription',
    description: string,
    relatedId?: string
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO credit_transactions (user_id, amount, type, description, related_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(userId, amount, type, description, relatedId || null);
  }

  /**
   * Deduct credits from user account
   */
  async deductCredits(
    userId: number,
    amount: number,
    description: string,
    relatedId?: string,
    fid?: number
  ): Promise<boolean> {
    // Check if user is admin with unlimited access
    if (fid && adminService.bypassCreditCheck(fid)) {
      // Admin doesn't need credits, return success without deducting
      const stmt = this.db.prepare(`
        INSERT INTO credit_transactions (user_id, amount, type, description, related_id)
        VALUES (?, ?, 'usage', ?, ?)
      `);

      stmt.run(userId, 0, `${description} (Admin - no charge)`, relatedId || null);
      return true;
    }

    const balance = await this.getCreditBalance(userId);

    if (balance.balance < amount) {
      return false;
    }

    const stmt = this.db.prepare(`
      INSERT INTO credit_transactions (user_id, amount, type, description, related_id)
      VALUES (?, ?, 'usage', ?, ?)
    `);

    stmt.run(userId, -amount, description, relatedId || null);
    return true;
  }

  /**
   * Upgrade/Downgrade subscription
   */
  async changeSubscription(
    userId: number,
    newTier: string,
    stripeSubscriptionId?: string,
    stripeCustomerId?: string
  ): Promise<Subscription> {
    const db = getDb();

    // Get current subscription
    const currentSub = await this.getUserSubscription(userId);

    if (currentSub) {
      // Update existing
      const stmt = db.prepare(`
        UPDATE subscriptions
        SET tier = ?, status = 'active', stripe_subscription_id = ?, stripe_customer_id = ?
        WHERE id = ?
      `);

      stmt.run(newTier, stripeSubscriptionId || null, stripeCustomerId || null, currentSub.id);

      // Add monthly credits
      await this.addCredits(
        userId,
        TIERS[newTier].creditsPerMonth,
        'subscription',
        `Monthly credits for ${TIERS[newTier].name} plan`
      );

      return this.mapRowToSubscription({ ...currentSub, tier: newTier, stripeSubscriptionId, stripeCustomerId });
    } else {
      // Create new
      const stmt = db.prepare(`
        INSERT INTO subscriptions (user_id, tier, status, credits_per_month, stripe_subscription_id, stripe_customer_id)
        VALUES (?, ?, 'active', ?, ?, ?)
      `);

      const result = stmt.run(
        userId,
        newTier,
        TIERS[newTier].creditsPerMonth,
        stripeSubscriptionId || null,
        stripeCustomerId || null
      );

      // Add monthly credits
      await this.addCredits(
        userId,
        TIERS[newTier].creditsPerMonth,
        'subscription',
        `Monthly credits for ${TIERS[newTier].name} plan`
      );

      return {
        id: result.lastInsertRowid as number,
        userId,
        tier: newTier as any,
        status: 'active',
        creditsPerMonth: TIERS[newTier].creditsPerMonth,
        startedAt: new Date().toISOString(),
        endsAt: null,
        stripeSubscriptionId,
        stripeCustomerId
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: number): Promise<void> {
    const db = getDb();

    const stmt = db.prepare(`
      UPDATE subscriptions
      SET status = 'canceled', ends_at = ?
      WHERE user_id = ? AND status = 'active'
    `);

    stmt.run(new Date().toISOString(), userId);
  }

  private mapRowToSubscription(row: any): Subscription {
    return {
      id: row.id,
      userId: row.user_id,
      tier: row.tier,
      status: row.status,
      creditsPerMonth: row.credits_per_month,
      startedAt: row.started_at,
      endsAt: row.ends_at,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripeCustomerId: row.stripe_customer_id
    };
  }

  /**
   * Get available tiers
   */
  static getAvailableTiers(): SubscriptionTier[] {
    return Object.values(TIERS);
  }

  /**
   * Get tier details
   */
  static getTierDetails(tier: string): SubscriptionTier | null {
    return TIERS[tier] || null;
  }
}
