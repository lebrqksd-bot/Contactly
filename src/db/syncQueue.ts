import { getDatabase } from './database';
import { SyncQueueItem, Contact } from '@/types';

export const syncQueueRepository = {
  // Add item to sync queue
  async add(item: SyncQueueItem): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO sync_queue (contact_id, operation, data) VALUES (?, ?, ?)',
      [item.contact_id, item.operation, item.data ? JSON.stringify(item.data) : null]
    );
  },

  // Get all pending items
  async getAll(): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    const result = await db.getAllAsync<SyncQueueItem>(
      'SELECT * FROM sync_queue ORDER BY created_at ASC'
    );
    return result.map((item) => ({
      ...item,
      data: item.data ? JSON.parse(item.data) : undefined,
    }));
  },

  // Remove item from queue
  async remove(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  },

  // Clear queue
  async clear(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM sync_queue');
  },

  // Get count
  async count(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_queue'
    );
    return result?.count || 0;
  },
};

