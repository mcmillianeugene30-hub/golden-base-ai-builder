/**
 * Marketplace Service - Manage apps and connectors marketplace
 */

import { getDb } from '../lib/db';

export interface MarketplaceListing {
  id: number;
  type: 'app' | 'connector';
  userId: number;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl: string;
  downloads: number;
  views: number;
  rating: number;
  reviewCount: number;
  status: 'published' | 'pending' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceReview {
  id: number;
  listingId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export class MarketplaceService {
  /**
   * Create marketplace listing
   */
  async createListing(
    userId: number,
    data: {
      type: 'app' | 'connector';
      appId?: number;
      connectorId?: number;
      title: string;
      description: string;
      price: number;
      category: string;
      tags: string[];
      imageUrl: string;
    }
  ): Promise<{ success: boolean; listingId?: number; error?: string }> {
    const db = getDb();

    try {
      const stmt = db.prepare(`
        INSERT INTO marketplace_listings
        (user_id, app_id, connector_id, type, title, description, price, category, tags, image_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `);

      const result = stmt.run(
        userId,
        data.appId || null,
        data.connectorId || null,
        data.type,
        data.title,
        data.description,
        data.price,
        data.category,
        JSON.stringify(data.tags),
        data.imageUrl
      );

      return { success: true, listingId: result.lastInsertRowid as number };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get published listings
   */
  async getListings(filters: {
    type?: 'app' | 'connector';
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<MarketplaceListing[]> {
    const db = getDb();

    let query = `
      SELECT
        ml.*,
        u.username,
        u.fid
      FROM marketplace_listings ml
      JOIN users u ON ml.user_id = u.id
      WHERE ml.status = 'published'
    `;

    const params: any[] = [];

    if (filters.type) {
      query += ' AND ml.type = ?';
      params.push(filters.type);
    }

    if (filters.category) {
      query += ' AND ml.category = ?';
      params.push(filters.category);
    }

    if (filters.search) {
      query += ' AND (ml.title LIKE ? OR ml.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY ml.downloads DESC, ml.rating DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      price: row.price,
      category: row.category,
      tags: JSON.parse(row.tags || '[]'),
      imageUrl: row.image_url,
      downloads: row.downloads,
      views: row.views,
      rating: row.rating,
      reviewCount: row.review_count,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  /**
   * Get trending listings
   */
  async getTrending(limit: number = 10): Promise<MarketplaceListing[]> {
    const db = getDb();

    // Trending = high downloads in last 7 days
    const stmt = db.prepare(`
      SELECT
        ml.*,
        u.username,
        u.fid
      FROM marketplace_listings ml
      JOIN users u ON ml.user_id = u.id
      WHERE ml.status = 'published'
        AND ml.created_at >= datetime('now', '-7 days')
      ORDER BY (ml.downloads * 0.6 + ml.rating * ml.review_count * 0.4) DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      price: row.price,
      category: row.category,
      tags: JSON.parse(row.tags || '[]'),
      imageUrl: row.image_url,
      downloads: row.downloads,
      views: row.views,
      rating: row.rating,
      reviewCount: row.review_count,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  /**
   * Get listing details
   */
  async getListing(listingId: number): Promise<MarketplaceListing | null> {
    const db = getDb();

    const stmt = db.prepare(`
      SELECT
        ml.*,
        u.username,
        u.fid
      FROM marketplace_listings ml
      JOIN users u ON ml.user_id = u.id
      WHERE ml.id = ?
    `);

    const row = stmt.get(listingId) as any;

    if (!row) {
      return null;
    }

    // Increment view count
    db.prepare('UPDATE marketplace_listings SET views = views + 1 WHERE id = ?').run(listingId);

    return {
      id: row.id,
      type: row.type,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      price: row.price,
      category: row.category,
      tags: JSON.parse(row.tags || '[]'),
      imageUrl: row.image_url,
      downloads: row.downloads,
      views: row.views + 1,
      rating: row.rating,
      reviewCount: row.review_count,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Add review
   */
  async addReview(
    userId: number,
    listingId: number,
    rating: number,
    comment: string
  ): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    try {
      // Check if user already reviewed
      const existingStmt = db.prepare(`
        SELECT * FROM reviews WHERE user_id = ? AND listing_id = ?
      `);
      const existing = existingStmt.get(userId, listingId);

      if (existing) {
        // Update existing review
        db.prepare(`
          UPDATE reviews SET rating = ?, comment = ?, created_at = datetime('now')
          WHERE user_id = ? AND listing_id = ?
        `).run(rating, comment, userId, listingId);
      } else {
        // Add new review
        db.prepare(`
          INSERT INTO reviews (user_id, listing_id, rating, comment)
          VALUES (?, ?, ?, ?)
        `).run(userId, listingId, rating, comment);
      }

      // Recalculate listing rating
      this.updateListingRating(listingId);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get listing reviews
   */
  async getReviews(listingId: number): Promise<MarketplaceReview[]> {
    const db = getDb();

    const stmt = db.prepare(`
      SELECT
        r.*,
        u.username,
        u.fid
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.listing_id = ?
      ORDER BY r.created_at DESC
    `);

    const rows = stmt.all(listingId) as any[];

    return rows.map((row) => ({
      id: row.id,
      listingId: row.listing_id,
      userId: row.user_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at
    }));
  }

  /**
   * Update listing rating
   */
  private updateListingRating(listingId: number): void {
    const db = getDb();

    const stmt = db.prepare(`
      UPDATE marketplace_listings
      SET
        rating = (SELECT AVG(rating) FROM reviews WHERE listing_id = ?),
        review_count = (SELECT COUNT(*) FROM reviews WHERE listing_id = ?)
      WHERE id = ?
    `);

    stmt.run(listingId, listingId, listingId);
  }

  /**
   * Download/increment usage
   */
  async incrementDownloads(listingId: number): Promise<void> {
    const db = getDb();
    db.prepare('UPDATE marketplace_listings SET downloads = downloads + 1 WHERE id = ?').run(listingId);
  }

  /**
   * Get categories
   */
  async getCategories(type?: 'app' | 'connector'): Promise<Array<{ name: string; count: number }>> {
    const db = getDb();

    let query = `
      SELECT category, COUNT(*) as count
      FROM marketplace_listings
      WHERE status = 'published'
    `;

    const params: any[] = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' GROUP BY category ORDER BY count DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map((row) => ({ name: row.category, count: row.count }));
  }

  /**
   * Get developer earnings
   */
  async getDeveloperEarnings(userId: number): Promise<{
    totalEarned: number;
    pendingPayouts: number;
    transactions: Array<{
      id: number;
      amount: number;
      payoutStatus: string;
      createdAt: string;
    }>
  }> {
    const db = getDb();

    const totalStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM developer_earnings
      WHERE developer_id = ?
    `);

    const pendingStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM developer_earnings
      WHERE developer_id = ? AND payout_status = 'pending'
    `);

    const transactionsStmt = db.prepare(`
      SELECT id, amount, payout_status, created_at
      FROM developer_earnings
      WHERE developer_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const total = totalStmt.get(userId) as any;
    const pending = pendingStmt.get(userId) as any;
    const transactions = transactionsStmt.all(userId) as any[];

    return {
      totalEarned: total.total || 0,
      pendingPayouts: pending.total || 0,
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        payoutStatus: t.payout_status,
        createdAt: t.created_at
      }))
    };
  }

  /**
   * Request payout
   */
  async requestPayout(
    userId: number,
    amount: number,
    method: 'stripe' | 'crypto',
    address?: string
  ): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    try {
      // Create earning record
      const stmt = db.prepare(`
        INSERT INTO developer_earnings (developer_id, amount, payout_status, payout_method, payout_address)
        VALUES (?, ?, 'pending', ?, ?)
      `);

      stmt.run(userId, amount, method, address || null);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
