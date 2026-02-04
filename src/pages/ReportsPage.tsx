import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { HiDocumentDownload } from 'react-icons/hi';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const COLORS = [
  '#EF4444',
  '#F59E0B',
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#D946EF',
  '#FB923C',
  '#64748B',
];

export default function ReportsPage() {
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: monthlyReport } = useQuery({
    queryKey: ['monthly-report', month, year],
    queryFn: () => reportsService.getMonthly(month, year),
  });

  const { data: yearlyTrend } = useQuery({
    queryKey: ['yearly-trend', year],
    queryFn: () => reportsService.getYearlyTrend(year),
  });

  const barData = monthlyReport
    ? [
        {
          name: t('dashboard.income'),
          value: monthlyReport.totalIncome,
          fill: '#10B981',
        },
        {
          name: t('dashboard.expenses'),
          value: monthlyReport.totalExpense,
          fill: '#EF4444',
        },
      ]
    : [];

  const pieData =
    monthlyReport?.expensesByCategory.map((item) => ({
      name: item.category.name,
      value: item.total,
      color: item.category.color,
    })) ?? [];

  const lineData =
    yearlyTrend?.months.map((m) => ({
      name: MONTHS[m.month - 1],
      income: m.income,
      expense: m.expense,
    })) ?? [];

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const exportCSV = () => {
    if (!monthlyReport) return;

    const rows = [['Category', 'Type', 'Amount']];

    monthlyReport.incomeByCategory.forEach((i) =>
      rows.push([i.category.name, 'Income', String(i.total)]),
    );
    monthlyReport.expensesByCategory.forEach((e) =>
      rows.push([e.category.name, 'Expense', String(e.total)]),
    );

    rows.push(['', '', '']);
    rows.push(['Total Income', '', String(monthlyReport.totalIncome)]);
    rows.push(['Total Expenses', '', String(monthlyReport.totalExpense)]);
    rows.push(['Balance', '', String(monthlyReport.balance)]);

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${year}-${String(month).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    alert(
      'PDF export requires a running backend with pdfkit. This is a placeholder.',
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('reports.title')}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <HiDocumentDownload className="w-4 h-4" /> {t('reports.exportCsv')}
          </button>
          <button
            onClick={exportPDF}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <HiDocumentDownload className="w-4 h-4" /> {t('reports.exportPdf')}
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="input-field w-auto"
          aria-label={t('budgets.month')}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2024, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input-field w-auto"
          aria-label={t('budgets.year')}
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      {monthlyReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-sm text-gray-500">{t('dashboard.income')}</p>
            <p className="text-2xl font-bold text-green-600">
              +{formatCurrency(monthlyReport.totalIncome)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500">{t('dashboard.expenses')}</p>
            <p className="text-2xl font-bold text-red-600">
              -{formatCurrency(monthlyReport.totalExpense)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500">{t('dashboard.balance')}</p>
            <p
              className={`text-2xl font-bold ${monthlyReport.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}
            >
              {formatCurrency(monthlyReport.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly income vs expenses */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('reports.incomeVsExpenses')}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by category pie */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('reports.expensesByCategory')}
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }: PieLabelRenderProps) =>
                    `${name ?? ''} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              {t('common.noData')}
            </div>
          )}
        </div>
      </div>

      {/* Yearly trend */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('reports.yearlyTrend')} ({year})
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={2}
              name={t('dashboard.income')}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#EF4444"
              strokeWidth={2}
              name={t('dashboard.expenses')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
