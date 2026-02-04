import api from './api';
import type { Budget, BudgetStatus } from '../types';

export const budgetsService = {
  async getAll(params?: { month?: number; year?: number }): Promise<Budget[]> {
    const { data } = await api.get('/budgets', { params });
    return data;
  },

  async getStatus(month: number, year: number): Promise<BudgetStatus[]> {
    const { data } = await api.get('/budgets/status', { params: { month, year } });
    return data;
  },

  async create(budget: { categoryId: string; amount: number; month: number; year: number }): Promise<Budget> {
    const { data } = await api.post('/budgets', budget);
    return data;
  },

  async update(id: string, amount: number): Promise<Budget> {
    const { data } = await api.put(`/budgets/${id}`, { amount });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
