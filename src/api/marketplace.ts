/**
 * Marketplace API - Browse and manage marketplace listings
 */

import { Hono } from 'hono';
import { MarketplaceService } from '../services/marketplace';
import { getDb } from '../lib/db';

const marketplaceRouter = new Hono();

// Browse marketplace
marketplaceRouter.get('/', async (c) => {
  try {
    const type = c.req.query('type') as 'app' | 'connector' | undefined;
    const category = c.req.query('category');
    const search = c.req.query('search');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const marketplaceService = new MarketplaceService();
    const listings = await marketplaceService.getListings({
      type,
      category,
      search,
      limit,
      offset
    });

    return c.json({
      success: true,
      listings,
      count: listings.length
    });
  } catch (error: any) {
    console.error('Marketplace browse error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get trending items
marketplaceRouter.get('/trending', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');

    const marketplaceService = new MarketplaceService();
    const trending = await marketplaceService.getTrending(limit);

    return c.json({
      success: true,
      trending
    });
  } catch (error: any) {
    console.error('Trending error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get listing details
marketplaceRouter.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    const marketplaceService = new MarketplaceService();
    const listing = await marketplaceService.getListing(id);

    if (!listing) {
      return c.json({ success: false, error: 'Listing not found' }, 404);
    }

    return c.json({ success: true, listing });
  } catch (error: any) {
    console.error('Get listing error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get listing reviews
marketplaceRouter.get('/:id/reviews', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    const marketplaceService = new MarketplaceService();
    const reviews = await marketplaceService.getReviews(id);

    return c.json({
      success: true,
      reviews
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Submit review
marketplaceRouter.post('/:id/review', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { fid, rating, comment } = await c.req.json();

    if (!fid || !rating) {
      return c.json({ success: false, error: 'FID and rating required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const marketplaceService = new MarketplaceService();
    const result = await marketplaceService.addReview(user.id, id, rating, comment);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({ success: true, message: 'Review submitted' });
  } catch (error: any) {
    console.error('Submit review error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Submit to marketplace
marketplaceRouter.post('/submit', async (c) => {
  try {
    const {
      fid,
      type,
      appId,
      connectorId,
      title,
      description,
      price,
      category,
      tags,
      imageUrl
    } = await c.req.json();

    if (!fid || !type || !title) {
      return c.json({ success: false, error: 'FID, type, and title required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const marketplaceService = new MarketplaceService();
    const result = await marketplaceService.createListing(user.id, {
      type,
      appId,
      connectorId,
      title,
      description,
      price: price || 0,
      category,
      tags: tags || [],
      imageUrl
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      message: 'Listing submitted for review',
      listingId: result.listingId
    });
  } catch (error: any) {
    console.error('Submit listing error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get developer earnings
marketplaceRouter.get('/developer/earnings', async (c) => {
  const fid = c.req.query('fid');

  if (!fid) {
    return c.json({ success: false, error: 'FID required' }, 400);
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  const marketplaceService = new MarketplaceService();
  const earnings = await marketplaceService.getDeveloperEarnings(user.id);

  return c.json({
    success: true,
    earnings
  });
});

// Request payout
marketplaceRouter.post('/developer/payout', async (c) => {
  try {
    const { fid, amount, method, address } = await c.req.json();

    if (!fid || !amount || !method) {
      return c.json({ success: false, error: 'FID, amount, and method required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const marketplaceService = new MarketplaceService();
    const result = await marketplaceService.requestPayout(user.id, amount, method, address);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({ success: true, message: 'Payout requested' });
  } catch (error: any) {
    console.error('Request payout error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get categories
marketplaceRouter.get('/categories/list', async (c) => {
  try {
    const type = c.req.query('type') as 'app' | 'connector' | undefined;

    const marketplaceService = new MarketplaceService();
    const categories = await marketplaceService.getCategories(type);

    return c.json({ success: true, categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default marketplaceRouter;
