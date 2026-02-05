import * as SQLite from 'expo-sqlite';
import { Contact, ContactPhone, ContactEmail, Designation, SyncQueueItem } from '@/types';
import { Platform } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;

// Web-compatible database mock
class WebDatabase {
  private data: Map<string, any[]> = new Map();

  async getAllAsync(query: string, params: any[] = []): Promise<any[]> {
    const table = this.extractTable(query);
    return this.data.get(table) || [];
  }

  async getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
    const results = await this.getAllAsync(query, params);
    return results[0] || null;
  }

  async execAsync(sql: string): Promise<void> {
    // Parse CREATE TABLE statements
    if (sql.includes('CREATE TABLE')) {
      const tableMatch = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        if (!this.data.has(tableName)) {
          this.data.set(tableName, []);
        }
      }
    }
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    // Simple implementation for web
    return { lastInsertRowId: Date.now(), changes: 1 };
  }

  async closeAsync(): Promise<void> {
    // No-op for web
  }

  private extractTable(query: string): string {
    const match = query.match(/FROM (\w+)/i);
    return match ? match[1] : 'contacts';
  }
}

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase | WebDatabase> => {
  // On web, use mock database
  if (Platform.OS === 'web') {
    if (!db) {
      db = new WebDatabase() as any;
      await initializeDatabase();
    }
    return db;
  }

  // On native, use real SQLite
  if (!db) {
    db = await SQLite.openDatabaseAsync('contacts.db');
    await initializeDatabase();
  }
  return db;
};

const initializeDatabase = async () => {
  if (!db) return;

  // Enable foreign keys (only for SQLite, not web)
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }

  // Create contacts table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      company TEXT,
      designation_id TEXT,
      profile_image_url TEXT,
      notes TEXT,
      address TEXT,
      last_visit TEXT,
      categories TEXT,
      synced_at TEXT,
      local_updated_at TEXT,
      deleted INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // Create contact_phones table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contact_phones (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      normalized_phone TEXT,
      label TEXT DEFAULT 'mobile',
      is_primary INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );
  `);

  // Create contact_emails table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contact_emails (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      email TEXT NOT NULL,
      label TEXT DEFAULT 'work',
      is_primary INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );
  `);

  // Create designations table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS designations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // Create sync_queue table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );
  `);

  // Create indexes
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_deleted ON contacts(deleted);
    CREATE INDEX IF NOT EXISTS idx_contacts_synced_at ON contacts(synced_at);
    CREATE INDEX IF NOT EXISTS idx_contact_phones_contact_id ON contact_phones(contact_id);
    CREATE INDEX IF NOT EXISTS idx_contact_emails_contact_id ON contact_emails(contact_id);
  `);
};

export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};

