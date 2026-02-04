import api from './api';
import type { MonthlyReport, YearlyTrend } from '../types';

export const reportsService = {
  async getMonthly(month: number, year: number): Promise<MonthlyReport> {
    const { data } = await api.get('/reports/monthly', { params: { month, year } });
    return data;
  },

  async getYearlyTrend(year: number): Promise<YearlyTrend> {
    const { data } = await api.get('/reports/yearly-trend', { params: { year } });
    return data;
  },
};
