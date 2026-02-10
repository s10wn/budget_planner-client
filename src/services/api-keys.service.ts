import api from './api';
import type { ApiKey } from '../types';

export const apiKeysService = {
  async getAll(): Promise<ApiKey[]> {
    const { data } = await api.get('/api-keys');
    return data;
  },

  async create(name: string): Promise<ApiKey> {
    const { data } = await api.post('/api-keys', { name });
    return data;
  },

  async revoke(id: string): Promise<ApiKey> {
    const { data } = await api.put(`/api-keys/${id}/revoke`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api-keys/${id}`);
  },
};
