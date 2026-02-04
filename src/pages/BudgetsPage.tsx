import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsService } from '../services/budgets.service';
import { categoriesService } from '../services/categories.service';
import type { Category } from '../types';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiX } from 'react-icons/hi';

export default function BudgetsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmount, setFormAmount] = useState('');

  const { data: budgetStatus } = useQuery({
    queryKey: ['budget-status', month, year],
    queryFn: () => budgetsService.getStatus(month, year),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      categoryId: string;
      amount: number;
      month: number;
      year: number;
    }) => budgetsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
      setShowForm(false);
      setFormCategoryId('');
      setFormAmount('');
      toast.success(t('common.save'));
    },
    onError: () => toast.error('Budget already exists for this category'),
  });

  const deleteMutation = useMutation({
    mutationFn: budgetsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
      toast.success(t('common.delete'));
    },
    onError: () => toast.error('Error deleting budget'),
  });

  const expenseCategories =
    categories?.filter((c: Category) => c.type === 'EXPENSE') || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      categoryId: formCategoryId,
      amount: parseFloat(formAmount),
      month,
      year,
    });
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-semibold text-[#37352F]">
          {t('budgets.title')}
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-4 h-4" /> {t('budgets.addNew')}
        </button>
      </div>

      {/* Month/Year selector */}
      <div className="flex gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="input-field w-auto"
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
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Add budget form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="card flex flex-col sm:flex-row gap-4 items-end"
        >
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-[#37352F] mb-1.5">
              {t('transactions.category')}
            </label>
            <select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- {t('common.select')} --</option>
              {expenseCategories.map((c: Category) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-[#37352F] mb-1.5">
              {t('budgets.amount')}
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="submit"
              className="btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? t('common.loading') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
              aria-label={t('common.close')}
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Budget cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetStatus?.length ? (
          budgetStatus.map((b) => (
            <div key={b.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{b.category?.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#37352F] truncate">
                      {b.category?.name}
                    </p>
                    <p className="text-xs text-[#787774]">
                      {formatCurrency(b.spentAmount)} /{' '}
                      {formatCurrency(b.budgetAmount)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(t('common.confirm')))
                      deleteMutation.mutate(b.id);
                  }}
                  className="text-[#B4B4B0] hover:text-[#E03E3E] shrink-0 ml-2 cursor-pointer transition-colors duration-150"
                  aria-label={t('common.delete')}
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
              <div
                className="w-full bg-[#E9E9E7] rounded-full h-2.5 mb-2"
                role="progressbar"
                aria-valuenow={Math.min(b.percentage, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${b.category?.name} budget progress`}
              >
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    b.isOverBudget
                      ? 'bg-[#E03E3E]'
                      : b.percentage > 80
                        ? 'bg-[#D9730D]'
                        : 'bg-[#0F7B6C]'
                  }`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#787774]">{b.percentage}%</span>
                <span
                  className={
                    b.isOverBudget
                      ? 'text-[#E03E3E] font-medium'
                      : 'text-[#0F7B6C]'
                  }
                >
                  {b.isOverBudget
                    ? t('budgets.overBudget')
                    : `${t('budgets.remaining')}: ${formatCurrency(b.remaining)}`}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 card text-center text-[#B4B4B0] py-8 text-sm">
            {t('common.noData')}
          </div>
        )}
      </div>
    </div>
  );
}
