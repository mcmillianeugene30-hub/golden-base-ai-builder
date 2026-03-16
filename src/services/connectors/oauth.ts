/**
 * OAuth Service - Handle OAuth 1.0a and 2.0 flows
 */

import crypto from 'crypto';
import { getDb } from '../lib/db';
import { SubscriptionService } from '../subscription';
import { getConnector } from './registry';

export interface OAuthState {
  userId: number;
  connectorId: string;
  state: string;
  redirectUri: string;
  createdAt: Date;
}

export class OAuthService {
  private subscriptionService = new SubscriptionService();

  /**
   * Generate OAuth state
   */
  private generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(
    userId: number,
    connectorId: string,
    redirectUri: string
  ): Promise<{ authUrl: string; state: string }> {
    const connector = getConnector(connectorId);
    if (!connector) {
      throw new Error('Connector not found');
    }

    if (connector.oauthVersion === 'none') {
      throw new Error('Connector does not use OAuth');
    }

    // Check if user already has this connector authorized
    const db = getDb();
    const existingStmt = db.prepare(`
      SELECT * FROM user_connectors
      WHERE user_id = ? AND connector_id = (SELECT id FROM connectors WHERE connector_id = ?)
    `);

    const existing = existingStmt.get(userId, connectorId) as any;
    if (existing) {
      throw new Error('Connector already authorized');
    }

    const state = this.generateState();
    const authUrl = this.buildAuthUrl(connector, state, redirectUri);

    // Store OAuth state (in production, use Redis with TTL)
    // For now, we'll skip state storage and use a simpler approach

    return { authUrl, state };
  }

  /**
   * Build authorization URL
   */
  private buildAuthUrl(
    connector: any,
    state: string,
    redirectUri: string
  ): string {
    const baseUrl = connector.authUrl;
    const clientId = this.getClientId(connector.id);

    if (connector.oauthVersion === '2.0') {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: connector.scope.join(' '),
        state: state
      });

      return `${baseUrl}?${params.toString()}`;
    } else {
      // OAuth 1.0a (simplified)
      return `${baseUrl}?oauth_callback=${redirectUri}`;
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    userId: number,
    connectorId: string,
    code: string,
    state: string
  ): Promise<{ success: boolean; message: string }> {
    const connector = getConnector(connectorId);
    if (!connector) {
      throw new Error('Connector not found');
    }

    try {
      // Exchange code for access token
      const tokens = await this.exchangeCodeForTokens(connector, code);

      // Store tokens
      const db = getDb();

      // Get connector database ID
      const connectorStmt = db.prepare('SELECT id FROM connectors WHERE connector_id = ?');
      const connectorRow = connectorStmt.get(connectorId) as any;

      if (!connectorRow) {
        // Create connector record if it doesn't exist
        const insertStmt = db.prepare(`
          INSERT INTO connectors (connector_id, name, description, category, price_per_use, revenue_share, status)
          VALUES (?, ?, ?, ?, ?, ?, 'active')
        `);

        const result = insertStmt.run(
          connector.id,
          connector.name,
          connector.description,
          connector.category,
          connector.pricePerUse,
          connector.developerShare
        );

        connectorRow = { id: result.lastInsertRowid };
      }

      // Store user connector
      const insertStmt = db.prepare(`
        INSERT INTO user_connectors (user_id, connector_id, access_token, refresh_token, scope)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        userId,
        connectorRow.id,
        tokens.accessToken,
        tokens.refreshToken || null,
        connector.scope.join(',')
      );

      return { success: true, message: `${connector.name} connected successfully!` };
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return { success: false, message: `Failed to connect: ${error.message}` };
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(
    connector: any,
    code: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    const clientId = this.getClientId(connector.id);
    const clientSecret = this.getClientSecret(connector.id);

    const response = await fetch(connector.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${process.env.BASE_URL || 'https://goldmine.zo.space'}/api/connectors/callback`
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
  }

  /**
   * Use connector (deduct credits and track usage)
   */
  async useConnector(
    userId: number,
    connectorId: string,
    action: string
  ): Promise<{ success: boolean; creditsUsed?: number; error?: string }> {
    const db = getDb();
    const connector = getConnector(connectorId);

    if (!connector) {
      return { success: false, error: 'Connector not found' };
    }

    // Check if user has this connector authorized
    const authStmt = db.prepare(`
      SELECT uc.* FROM user_connectors uc
      JOIN connectors c ON uc.connector_id = c.id
      WHERE c.connector_id = ? AND uc.user_id = ?
    `);

    const auth = authStmt.get(connectorId, userId) as any;

    if (!auth) {
      return { success: false, error: 'Connector not authorized' };
    }

    // Deduct credits
    const success = await this.subscriptionService.deductCredits(
      userId,
      connector.pricePerUse,
      `Connector usage: ${connector.name} - ${action}`,
      connectorId
    );

    if (!success) {
      return { success: false, error: 'Insufficient credits' };
    }

    // Calculate revenue share
    const developerEarned = Math.floor(connector.pricePerUse * (connector.developerShare / 100));
    const platformEarned = connector.pricePerUse - developerEarned;

    // Record usage
    const usageStmt = db.prepare(`
      INSERT INTO connector_usage (user_connector_id, action, credits_used, developer_earned, platform_earned)
      VALUES (?, ?, ?, ?, ?)
    `);

    usageStmt.run(auth.id, action, connector.pricePerUse, developerEarned, platformEarned);

    return { success: true, creditsUsed: connector.pricePerUse };
  }

  /**
   * Revoke connector authorization
   */
  async revokeConnector(
    userId: number,
    connectorId: string
  ): Promise<{ success: boolean }> {
    const db = getDb();

    const stmt = db.prepare(`
      DELETE FROM user_connectors
      WHERE user_id = ? AND connector_id = (SELECT id FROM connectors WHERE connector_id = ?)
    `);

    const result = stmt.run(userId, connectorId);

    return { success: (result.changes || 0) > 0 };
  }

  /**
   * Get user's authorized connectors
   */
  async getUserConnectors(userId: number): Promise<Array<{
    id: string;
    name: string;
    category: string;
    icon: string;
    authorizedAt: string
  }>> {
    const db = getDb();

    const stmt = db.prepare(`
      SELECT
        c.connector_id,
        c.name,
        c.category,
        c.icon,
        uc.authorized_at
      FROM user_connectors uc
      JOIN connectors c ON uc.connector_id = c.id
      WHERE uc.user_id = ?
      ORDER BY uc.authorized_at DESC
    `);

    const rows = stmt.all(userId) as any[];

    return rows.map((row) => ({
      id: row.connector_id,
      name: row.name,
      category: row.category,
      icon: row.icon,
      authorizedAt: row.authorized_at
    }));
  }

  /**
   * Get connector ID for OAuth
   */
  private getClientId(connectorId: string): string {
    return process.env[`${connectorId.toUpperCase()}_CLIENT_ID`] || '';
  }

  /**
   * Get connector secret for OAuth
   */
  private getClientSecret(connectorId: string): string {
    return process.env[`${connectorId.toUpperCase()}_CLIENT_SECRET`] || '';
  }
}
