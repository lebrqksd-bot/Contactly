// Web mock for expo-sqlite
// In-memory database for web
class WebSQLiteDatabase {
  constructor() {
    this.tables = new Map();
  }

  async execAsync(sql) {
    // Parse CREATE TABLE statements
    const createTableMatch = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
    if (createTableMatch) {
      const tableName = createTableMatch[1];
      if (!this.tables.has(tableName)) {
        this.tables.set(tableName, []);
      }
    }
  }

  async getAllAsync(query, params = []) {
    const tableMatch = query.match(/FROM (\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      let data = this.tables.get(tableName) || [];
      
      // Simple WHERE clause parsing
      if (query.includes('WHERE')) {
        if (query.includes('user_id = ?')) {
          const userId = params[0];
          data = data.filter(row => row.user_id === userId);
        }
        if (query.includes('deleted = 0') || query.includes('deleted = ?')) {
          data = data.filter(row => !row.deleted);
        }
        if (query.includes('id = ?')) {
          const id = params[params.length - 1];
          data = data.filter(row => row.id === id);
        }
      }
      
      return data;
    }
    return [];
  }

  async getFirstAsync(query, params = []) {
    const results = await this.getAllAsync(query, params);
    return results[0] || null;
  }

  async runAsync(sql, params = []) {
    // Simple INSERT/UPDATE/DELETE handling
    if (sql.includes('INSERT')) {
      return { changes: 1, lastInsertRowId: Date.now() };
    }
    return { changes: 0, lastInsertRowId: 0 };
  }

  async closeAsync() {
    // No-op
  }
}

export const openDatabaseAsync = async (name) => {
  return new WebSQLiteDatabase();
};

export default {
  openDatabaseAsync,
};

