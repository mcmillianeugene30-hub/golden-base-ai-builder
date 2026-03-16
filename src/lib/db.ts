/**
 * Database Layer - SQLite implementation
 */

import Database from 'better-sqlite3';
import { schema } from './schema';

const DB_PATH = process.env.DB_PATH || './golden-base.db';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Initialize schema
    db.exec(schema);

    console.log('Database initialized');
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Initialize database on module load
getDb();
