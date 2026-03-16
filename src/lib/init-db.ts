/**
 * Initialize database - Run schema migrations
 */

import { getDb } from './db';
import { adminService } from '../services/admin';

console.log('Initializing database...');

try {
  const db = getDb();

  // Check if tables exist
  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();

  if (tables.length === 0) {
    console.log('No tables found, creating schema...');
  } else {
    console.log(`Found ${tables.length} tables`);
  }

  // Ensure admin user exists
  const admin = await adminService.ensureAdminUser();
  console.log(`Admin user configured: FID ${admin.fid}, username ${admin.username}`);
  console.log(`Platform wallet: ${adminService.getPlatformWalletAddress()}`);
  console.log(`Platform revenue share: ${adminService.getPlatformRevenueShare()}%`);

  console.log('Database initialized successfully!');
  process.exit(0);
} catch (error) {
  console.error('Database initialization failed:', error);
  process.exit(1);
}
