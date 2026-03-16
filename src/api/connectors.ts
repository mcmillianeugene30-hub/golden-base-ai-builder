/**
 * Connector API - Manage connector marketplace and OAuth
 */

import { Hono } from 'hono';
import { OAuthService } from '../services/connectors/oauth';
import { getAllConnectors, getCategories } from '../services/connectors/registry';
import { SubscriptionService } from '../services/subscription';
import { getDb } from '../lib/db';

const connectorRouter = new Hono();

// List all available connectors
connectorRouter.get('/', (c) => {
  const category = c.req.query('category');
  const connectors = getAllConnectors();

  let filtered = connectors;
  if (category) {
    filtered = connectors.filter((c) => c.category === category);
  }

  return c.json({
    success: true,
    connectors: filtered.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      category: c.category,
      icon: c.icon,
      pricePerUse: c.pricePerUse
    }))
  });
});

// Get connector categories
connectorRouter.get('/categories', (c) => {
  const categories = getCategories();
  return c.json({ success: true, categories });
});

// Get specific connector
connectorRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const connector = getAllConnectors().find((c) => c.id === id);

  if (!connector) {
    return c.json({ success: false, error: 'Connector not found' }, 404);
  }

  return c.json({
    success: true,
    connector: {
      id: connector.id,
      name: connector.name,
      description: connector.description,
      category: connector.category,
      icon: connector.icon,
      pricePerUse: connector.pricePerUse,
      scope: connector.scope
    }
  });
});

// Initiate OAuth flow
connectorRouter.post('/:id/authorize', async (c) => {
  try {
    const id = c.req.param('id');
    const { fid } = await c.req.json();

    if (!fid) {
      return c.json({ success: false, error: 'FID required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const oauthService = new OAuthService();
    const redirectUri = `${process.env.BASE_URL || 'https://goldmine.zo.space'}/api/connectors/${id}/callback`;

    const result = await oauthService.initiateOAuth(user.id, id, redirectUri);

    return c.json({
      success: true,
      authUrl: result.authUrl,
      state: result.state
    });
  } catch (error: any) {
    console.error('Authorize error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// OAuth callback
connectorRouter.get('/:id/callback', async (c) => {
  try {
    const id = c.req.param('id');
    const code = c.req.query('code');
    const state = c.req.query('state');
    const fid = c.req.query('fid');

    if (!code || !fid) {
      return c.json({ success: false, error: 'Code and FID required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const oauthService = new OAuthService();
    const result = await oauthService.handleCallback(user.id, id, code, state);

    if (result.success) {
      // Redirect to success page
      return c.redirect(`${process.env.BASE_URL || 'https://goldmine.zo.space'}/marketplace?connected=${id}`);
    } else {
      return c.redirect(`${process.env.BASE_URL || 'https://goldmine.zo.space'}/marketplace?error=${encodeURIComponent(result.message)}`);
    }
  } catch (error: any) {
    console.error('Callback error:', error);
    return c.redirect(`${process.env.BASE_URL || 'https://goldmine.zo.space'}/marketplace?error=Connection failed`);
  }
});

// Use connector
connectorRouter.post('/:id/use', async (c) => {
  try {
    const id = c.req.param('id');
    const { fid, action } = await c.req.json();

    if (!fid || !action) {
      return c.json({ success: false, error: 'FID and action required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const oauthService = new OAuthService();
    const result = await oauthService.useConnector(user.id, id, action);

    return c.json(result);
  } catch (error: any) {
    console.error('Use connector error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user's authorized connectors
connectorRouter.get('/user/authorized', async (c) => {
  const fid = c.req.query('fid');

  if (!fid) {
    return c.json({ success: false, error: 'FID required' }, 400);
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  const oauthService = new OAuthService();
  const connectors = await oauthService.getUserConnectors(user.id);

  return c.json({ success: true, connectors });
});

// Revoke connector
connectorRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { fid } = await c.req.json();

    if (!fid) {
      return c.json({ success: false, error: 'FID required' }, 400);
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE fid = ?').get(parseInt(fid)) as any;

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const oauthService = new OAuthService();
    const result = await oauthService.revokeConnector(user.id, id);

    return c.json(result);
  } catch (error: any) {
    console.error('Revoke error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default connectorRouter;
