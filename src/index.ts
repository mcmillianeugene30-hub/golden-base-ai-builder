/**
 * Main entry point for Golden Base AI Builder v2.0
 * Integrates all API routes and middleware
 */

import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';

// Import route handlers
import generateAppRouter from './api/generate-app';
import editRouter from './api/edit';
import subscriptionRouter from './api/subscription';
import paymentRouter from './api/payment';
import connectorRouter from './api/connectors';
import marketplaceRouter from './api/marketplace';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '2.0.0'
  });
});

// Mount API routes
app.route('/api/generate-app', generateAppRouter);
app.route('/api/edit', editRouter);
app.route('/api/subscription', subscriptionRouter);
app.route('/api/payment', paymentRouter);
app.route('/api/connectors', connectorRouter);
app.route('/api/marketplace', marketplaceRouter);

// Serve static files (for frontend assets)
app.use('/*', serveStatic({ root: './dist' }));

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found'
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    success: false,
    error: err.message || 'Internal server error'
  }, 500);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
