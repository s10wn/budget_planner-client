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
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const COLORS = [
  '#E03E3E', '#D9730D', '#0B6E99', '#0F7B6C', '#6940A5',
  '#AD1A72', '#2EAADC', '#DFAB01', '#64473A', '#787774',
];

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E9E9E7',
    borderRadius: '6px',
    color: '#37352F',
  },
  labelStyle: { color: '#787774' },
};

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
          fill: '#0F7B6C',
        },
        {
          name: t('dashboard.expenses'),
          value: monthlyReport.totalExpense,
          fill: '#E03E3E',
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
        <h1 className="text-xl font-semibold text-[#37352F]">
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
          <div className="card text-center border-l-4 border-l-[#0F7B6C]">
            <p className="text-sm text-[#787774]">{t('dashboard.income')}</p>
            <p className="text-xl font-semibold text-[#0F7B6C]">
              +{formatCurrency(monthlyReport.totalIncome)}
            </p>
          </div>
          <div className="card text-center border-l-4 border-l-[#E03E3E]">
            <p className="text-sm text-[#787774]">{t('dashboard.expenses')}</p>
            <p className="text-xl font-semibold text-[#E03E3E]">
              -{formatCurrency(monthlyReport.totalExpense)}
            </p>
          </div>
          <div className="card text-center border-l-4 border-l-[#6940A5]">
            <p className="text-sm text-[#787774]">{t('dashboard.balance')}</p>
            <p
              className={`text-xl font-semibold ${monthlyReport.balance >= 0 ? 'text-[#6940A5]' : 'text-[#E03E3E]'}`}
            >
              {formatCurrency(monthlyReport.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-semibold text-[#37352F] mb-4">
            {t('reports.incomeVsExpenses')}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" />
              <XAxis dataKey="name" stroke="#787774" fontSize={12} />
              <YAxis stroke="#787774" fontSize={12} />
              <Tooltip
                {...chartTooltipStyle}
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-[#37352F] mb-4">
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
                  {...chartTooltipStyle}
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[#B4B4B0] text-sm">
              {t('common.noData')}
            </div>
          )}
        </div>
      </div>

      {/* Yearly trend */}
      <div className="card">
        <h2 className="text-base font-semibold text-[#37352F] mb-4">
          {t('reports.yearlyTrend')} ({year})
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" />
            <XAxis dataKey="name" stroke="#787774" fontSize={12} />
            <YAxis stroke="#787774" fontSize={12} />
            <Tooltip
              {...chartTooltipStyle}
              formatter={(value) => formatCurrency(Number(value ?? 0))}
            />
            <Legend wrapperStyle={{ color: '#787774', fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#0F7B6C"
              strokeWidth={2}
              name={t('dashboard.income')}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#E03E3E"
              strokeWidth={2}
              name={t('dashboard.expenses')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
