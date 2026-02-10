import api from './api';
import type { Category } from '../types';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get('/categories');
    return data;
  },

  async create(category: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string; color?: string }): Promise<Category> {
    const { data } = await api.post('/categories', category);
    return data;
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const { data } = await api.put(`/categories/${id}`, updates);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
