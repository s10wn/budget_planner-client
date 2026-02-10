import api from './api';
import type { Transaction, PaginatedResponse } from '../types';

export const transactionsService = {
  async getAll(params?: Record<string, string>): Promise<PaginatedResponse<Transaction>> {
    const { data } = await api.get('/transactions', { params });
    return data;
  },

  async getOne(id: string): Promise<Transaction> {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },

  async create(transaction: {
    categoryId: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    currency?: string;
    description?: string;
    date?: string;
  }): Promise<Transaction> {
    const { data } = await api.post('/transactions', transaction);
    return data;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data } = await api.put(`/transactions/${id}`, updates);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async getBalance(): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const { data } = await api.get('/transactions/balance');
    return data;
  },

  async getRecent(): Promise<Transaction[]> {
    const { data } = await api.get('/transactions/recent');
    return data;
  },
};
