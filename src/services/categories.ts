import { supabase } from './supabase';
import { Category } from '@/types';

export const categoriesService = {
  // Get all categories (user's + defaults)
  async getAll(): Promise<Category[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user.id},is_default.eq.true,user_id.is.null`)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Create category
  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate color if not provided
    const colors = [
      '#6200ee', '#2196F3', '#4CAF50', '#FF9800', '#F44336',
      '#9C27B0', '#E91E63', '#00BCD4', '#795548', '#607D8B'
    ];
    const color = category.color || colors[Math.floor(Math.random() * colors.length)];

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        user_id: user.id,
        color,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update category
  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete category
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

