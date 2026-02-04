import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import { reportsService } from '../services/reports.service';
import { budgetsService } from '../services/budgets.service';
import { format } from 'date-fns';
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
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { HiArrowUp, HiArrowDown, HiCash } from 'react-icons/hi';

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

export default function DashboardPage() {
  const { t } = useTranslation();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: balance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => transactionsService.getBalance(),
  });

  const { data: recent, isLoading: isRecentLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => transactionsService.getRecent(),
  });

  const { data: monthlyReport, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['monthly-report', currentMonth, currentYear],
    queryFn: () => reportsService.getMonthly(currentMonth, currentYear),
  });

  const { data: yearlyTrend } = useQuery({
    queryKey: ['yearly-trend', currentYear],
    queryFn: () => reportsService.getYearlyTrend(currentYear),
  });

  const { data: budgetStatus } = useQuery({
    queryKey: ['budget-status', currentMonth, currentYear],
    queryFn: () => budgetsService.getStatus(currentMonth, currentYear),
  });

  const barData =
    yearlyTrend?.months.map((m) => ({
      name: MONTHS[m.month - 1],
      income: m.income,
      expense: m.expense,
    })) ?? [];

  const pieData =
    monthlyReport?.expensesByCategory.map((item) => ({
      name: item.category.name,
      value: item.total,
      color: item.category.color,
    })) ?? [];

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {t('dashboard.title')}
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <HiCash className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">{t('dashboard.balance')}</p>
            {isBalanceLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 truncate">
                {formatCurrency(balance?.balance ?? 0)}
              </p>
            )}
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <HiArrowUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">{t('dashboard.income')}</p>
            {isMonthlyLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-green-600 truncate">
                +{formatCurrency(monthlyReport?.totalIncome ?? 0)}
              </p>
            )}
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <HiArrowDown className="w-6 h-6 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">{t('dashboard.expenses')}</p>
            {isMonthlyLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-red-600 truncate">
                -{formatCurrency(monthlyReport?.totalExpense ?? 0)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - yearly income vs expenses */}
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
              <Legend />
              <Bar
                dataKey="income"
                fill="#10B981"
                name={t('dashboard.income')}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                fill="#EF4444"
                name={t('dashboard.expenses')}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - expenses by category */}
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

      {/* Recent transactions + Budget status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('dashboard.recentTransactions')}
          </h2>
          <div className="space-y-3">
            {isRecentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))
            ) : recent?.length ? (
              recent.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">
                      {tx.category?.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {tx.category?.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {tx.description ||
                          format(new Date(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold shrink-0 ml-2 ${
                      tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                {t('common.noData')}
              </p>
            )}
          </div>
        </div>

        {/* Budget status */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('dashboard.budgetOverview')}
          </h2>
          <div className="space-y-4">
            {budgetStatus?.length ? (
              budgetStatus.map((b) => (
                <div key={b.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {b.category?.icon} {b.category?.name}
                    </span>
                    <span
                      className={`text-sm font-medium shrink-0 ml-2 ${
                        b.isOverBudget ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      {formatCurrency(b.spentAmount)} /{' '}
                      {formatCurrency(b.budgetAmount)}
                    </span>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-2.5"
                    role="progressbar"
                    aria-valuenow={Math.min(b.percentage, 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${b.category?.name} budget progress`}
                  >
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        b.isOverBudget
                          ? 'bg-red-500'
                          : b.percentage > 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                  {b.isOverBudget && (
                    <p className="text-xs text-red-500 mt-1">
                      {t('budgets.overBudget')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                {t('common.noData')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
