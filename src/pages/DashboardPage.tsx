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
  '#E03E3E', '#D9730D', '#0B6E99', '#0F7B6C', '#6940A5',
  '#AD1A72', '#2EAADC', '#DFAB01', '#64473A', '#787774',
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
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
      <h1 className="text-xl font-semibold text-[#37352F]">
        {t('dashboard.title')}
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4 border-l-4 border-l-[#6940A5]">
          <div className="w-10 h-10 bg-[#EAE4F2] rounded-lg flex items-center justify-center shrink-0">
            <HiCash className="w-5 h-5 text-[#6940A5]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[#787774]">{t('dashboard.balance')}</p>
            {isBalanceLoading ? (
              <div className="h-7 w-24 bg-[#F7F6F3] rounded animate-pulse" />
            ) : (
              <p className="text-xl font-semibold text-[#37352F] truncate">
                {formatCurrency(balance?.balance ?? 0)}
              </p>
            )}
          </div>
        </div>

        <div className="card flex items-center gap-4 border-l-4 border-l-[#0F7B6C]">
          <div className="w-10 h-10 bg-[#DDEDEA] rounded-lg flex items-center justify-center shrink-0">
            <HiArrowUp className="w-5 h-5 text-[#0F7B6C]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[#787774]">{t('dashboard.income')}</p>
            {isMonthlyLoading ? (
              <div className="h-7 w-24 bg-[#F7F6F3] rounded animate-pulse" />
            ) : (
              <p className="text-xl font-semibold text-[#0F7B6C] truncate">
                +{formatCurrency(monthlyReport?.totalIncome ?? 0)}
              </p>
            )}
          </div>
        </div>

        <div className="card flex items-center gap-4 border-l-4 border-l-[#E03E3E]">
          <div className="w-10 h-10 bg-[#FBE4E4] rounded-lg flex items-center justify-center shrink-0">
            <HiArrowDown className="w-5 h-5 text-[#E03E3E]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[#787774]">{t('dashboard.expenses')}</p>
            {isMonthlyLoading ? (
              <div className="h-7 w-24 bg-[#F7F6F3] rounded animate-pulse" />
            ) : (
              <p className="text-xl font-semibold text-[#E03E3E] truncate">
                -{formatCurrency(monthlyReport?.totalExpense ?? 0)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
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
              <Tooltip {...chartTooltipStyle} formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Legend wrapperStyle={{ color: '#787774', fontSize: 12 }} />
              <Bar dataKey="income" fill="#0F7B6C" name={t('dashboard.income')} radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" fill="#E03E3E" name={t('dashboard.expenses')} radius={[3, 3, 0, 0]} />
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
            <div className="flex items-center justify-center h-[300px] text-[#B4B4B0]">
              {t('common.noData')}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions + Budget status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-semibold text-[#37352F] mb-4">
            {t('dashboard.recentTransactions')}
          </h2>
          <div className="space-y-1">
            {isRecentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F7F6F3] rounded animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-[#F7F6F3] rounded animate-pulse" />
                      <div className="h-3 w-16 bg-[#F7F6F3] rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-[#F7F6F3] rounded animate-pulse" />
                </div>
              ))
            ) : recent?.length ? (
              recent.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 border-b border-[#E9E9E7] last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{tx.category?.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#37352F] truncate">
                        {tx.category?.name}
                      </p>
                      <p className="text-xs text-[#B4B4B0] truncate">
                        {tx.description || format(new Date(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium shrink-0 ml-2 ${
                      tx.type === 'INCOME' ? 'text-[#0F7B6C]' : 'text-[#E03E3E]'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[#B4B4B0] text-center py-4 text-sm">
                {t('common.noData')}
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-[#37352F] mb-4">
            {t('dashboard.budgetOverview')}
          </h2>
          <div className="space-y-4">
            {budgetStatus?.length ? (
              budgetStatus.map((b) => (
                <div key={b.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-[#37352F] truncate">
                      {b.category?.icon} {b.category?.name}
                    </span>
                    <span
                      className={`text-xs font-medium shrink-0 ml-2 ${
                        b.isOverBudget ? 'text-[#E03E3E]' : 'text-[#787774]'
                      }`}
                    >
                      {formatCurrency(b.spentAmount)} / {formatCurrency(b.budgetAmount)}
                    </span>
                  </div>
                  <div
                    className="w-full bg-[#E9E9E7] rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={Math.min(b.percentage, 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${b.category?.name} budget progress`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all ${
                        b.isOverBudget
                          ? 'bg-[#E03E3E]'
                          : b.percentage > 80
                            ? 'bg-[#D9730D]'
                            : 'bg-[#0F7B6C]'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                  {b.isOverBudget && (
                    <p className="text-xs text-[#E03E3E] mt-1">
                      {t('budgets.overBudget')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[#B4B4B0] text-center py-4 text-sm">
                {t('common.noData')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
