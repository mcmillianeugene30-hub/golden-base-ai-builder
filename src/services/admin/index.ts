/**
 * Admin Service - Manage platform admin and special permissions
 */

import { getDb } from '../../lib/db';
import { ADMIN_CONFIG } from '../../config/admin';

export class AdminService {
  private db = getDb();

  /**
   * Check if a user is the admin
   */
  isAdminUser(fid: number): boolean {
    return fid === ADMIN_CONFIG.fid;
  }

  /**
   * Check if a user has admin privileges (free unlimited access)
   */
  hasUnlimitedAccess(fid: number): boolean {
    return this.isAdminUser(fid) && ADMIN_CONFIG.freeUnlimitedAccess;
  }

  /**
   * Bypass subscription tier checks for admin
   */
  bypassSubscriptionCheck(fid: number): boolean {
    return this.isAdminUser(fid) && ADMIN_CONFIG.bypassSubscriptionChecks;
  }

  /**
   * Bypass credit balance checks for admin
   */
  bypassCreditCheck(fid: number): boolean {
    return this.isAdminUser(fid) && ADMIN_CONFIG.bypassCreditChecks;
  }

  /**
   * Get platform wallet address for payments
   */
  getPlatformWalletAddress(): `0x${string}` {
    return ADMIN_CONFIG.platformWalletAddress;
  }

  /**
   * Get platform revenue share percentage
   */
  getPlatformRevenueShare(): number {
    return ADMIN_CONFIG.platformRevenueSharePercent;
  }

  /**
   * Get creator/developer revenue share percentage
   */
  getCreatorRevenueShare(): number {
    return ADMIN_CONFIG.creatorRevenueSharePercent;
  }

  /**
   * Get admin user record from database
   */
  async getAdminUser(): Promise<{ id: number; fid: number; username: string } | null> {
    const stmt = this.db.prepare(`
      SELECT id, fid, username FROM users WHERE fid = ?
    `);

    const row = stmt.get(ADMIN_CONFIG.fid) as any;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      fid: row.fid,
      username: row.username
    };
  }

  /**
   * Ensure admin user exists in database
   */
  async ensureAdminUser(): Promise<{ id: number; fid: number; username: string }> {
    const existingUser = await this.getAdminUser();

    if (existingUser) {
      // Update username if needed
      if (existingUser.username !== ADMIN_CONFIG.username) {
        const updateStmt = this.db.prepare(`
          UPDATE users SET username = ? WHERE fid = ?
        `);
        updateStmt.run(ADMIN_CONFIG.username, ADMIN_CONFIG.fid);
        existingUser.username = ADMIN_CONFIG.username;
      }
      return existingUser;
    }

    // Create admin user
    const insertStmt = this.db.prepare(`
      INSERT INTO users (fid, username) VALUES (?, ?)
    `);

    const result = insertStmt.run(ADMIN_CONFIG.fid, ADMIN_CONFIG.username);

    return {
      id: result.lastInsertRowid as number,
      fid: ADMIN_CONFIG.fid,
      username: ADMIN_CONFIG.username
    };
  }

  /**
   * Get admin's effective subscription (always enterprise/unlimited)
   */
  getAdminSubscription() {
    return {
      id: -1,
      userId: -1,
      tier: 'enterprise',
      status: 'active',
      creditsPerMonth: Infinity,
      maxApps: Infinity,
      startedAt: new Date().toISOString(),
      endsAt: null
    };
  }

  /**
   * Calculate revenue split for a payment amount
   */
  calculateRevenueSplit(amount: number): {
    platformShare: number;
    creatorShare: number;
  } {
    const platformShare = amount * (ADMIN_CONFIG.platformRevenueSharePercent / 100);
    const creatorShare = amount * (ADMIN_CONFIG.creatorRevenueSharePercent / 100);

    return {
      platformShare: Math.round(platformShare * 100) / 100,
      creatorShare: Math.round(creatorShare * 100) / 100
    };
  }

  /**
   * Record platform earnings from revenue share
   */
  recordPlatformEarnings(
    paymentId: number,
    amount: number,
    description: string
  ): void {
    const { platformShare } = this.calculateRevenueSplit(amount);

    const stmt = this.db.prepare(`
      INSERT INTO developer_earnings (developer_id, amount, currency, payout_status, description)
      VALUES (?, ?, 'USD', 'pending', ?)
    `);

    // Use admin user ID as platform's earnings account
    this.ensureAdminUser().then(admin => {
      stmt.run(admin.id, platformShare, description);
    });
  }

  /**
   * Record creator/developer earnings from revenue share
   */
  recordCreatorEarnings(
    creatorId: number,
    paymentId: number,
    amount: number,
    connectorId?: number
  ): void {
    const { creatorShare } = this.calculateRevenueSplit(amount);

    const stmt = this.db.prepare(`
      INSERT INTO developer_earnings (developer_id, connector_id, amount, currency, payout_status)
      VALUES (?, ?, ?, 'USD', 'pending')
    `);

    stmt.run(creatorId, connectorId || null, creatorShare);
  }
}

// Singleton instance
export const adminService = new AdminService();
