import api from './api';

export const adminService = {
  async getUsers(page = 1, limit = 20) {
    const { data } = await api.get('/admin/users', { params: { page, limit } });
    return data;
  },

  async blockUser(id: string) {
    const { data } = await api.put(`/admin/users/${id}/block`);
    return data;
  },

  async unblockUser(id: string) {
    const { data } = await api.put(`/admin/users/${id}/unblock`);
    return data;
  },

  async deleteUser(id: string) {
    await api.delete(`/admin/users/${id}`);
  },

  async getDefaultCategories() {
    const { data } = await api.get('/admin/categories');
    return data;
  },

  async updateCategory(id: string, updates: Record<string, unknown>) {
    const { data } = await api.put(`/admin/categories/${id}`, updates);
    return data;
  },

  async deleteCategory(id: string) {
    await api.delete(`/admin/categories/${id}`);
  },

  async getCurrencies() {
    const { data } = await api.get('/admin/currencies');
    return data;
  },

  async updateCurrency(id: string, updates: Record<string, unknown>) {
    const { data } = await api.put(`/admin/currencies/${id}`, updates);
    return data;
  },

  async getSettings() {
    const { data } = await api.get('/admin/settings');
    return data;
  },

  async updateSettings(settings: Record<string, string>) {
    const { data } = await api.put('/admin/settings', settings);
    return data;
  },

  async getStatistics() {
    const { data } = await api.get('/admin/statistics');
    return data;
  },
};
