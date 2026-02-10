import api from './api';
import type { AuthResponse } from '../types';

export const authService = {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', { email, password, name });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getProfile() {
    const { data } = await api.get('/users/me');
    return data;
  },

  async updateProfile(updates: { name?: string; language?: string; currencyCode?: string }) {
    const { data } = await api.put('/users/me', updates);
    return data;
  },
};
