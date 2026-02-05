import { getDatabase } from './database';
import { Designation } from '@/types';
import { randomUUID } from 'expo-crypto';

export const designationRepository = {
  // Get all designations
  async getAll(userId?: string): Promise<Designation[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM designations WHERE 1=1';
    const params: any[] = [];

    if (userId) {
      query += ' AND (created_by = ? OR created_by IS NULL)';
      params.push(userId);
    }

    query += ' ORDER BY name ASC';

    const result = await db.getAllAsync(query, params);
    return result as Designation[];
  },

  // Get by ID
  async getById(id: string): Promise<Designation | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Designation>(
      'SELECT * FROM designations WHERE id = ?',
      [id]
    );
    return result || null;
  },

  // Create designation
  async create(designation: Designation): Promise<Designation> {
    const db = await getDatabase();
    const id = designation.id || randomUUID();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO designations (id, name, description, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        designation.name,
        designation.description || null,
        designation.created_by || null,
        now,
        now,
      ]
    );

    return designationRepository.getById(id) as Promise<Designation>;
  },

  // Update designation
  async update(designation: Designation): Promise<Designation> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE designations SET
        name = ?, description = ?, updated_at = ?
      WHERE id = ?`,
      [designation.name, designation.description || null, now, designation.id]
    );

    return designationRepository.getById(designation.id!) as Promise<Designation>;
  },

  // Delete designation
  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM designations WHERE id = ?', [id]);
  },
};

