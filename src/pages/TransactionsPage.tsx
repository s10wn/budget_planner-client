import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import { categoriesService } from '../services/categories.service';
import type { Transaction, Category } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';

export default function TransactionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form state
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formCurrency, setFormCurrency] = useState('USD');

  const { data: txData, isLoading } = useQuery({
    queryKey: ['transactions', page, typeFilter],
    queryFn: () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: '10',
      };
      if (typeFilter) params.type = typeFilter;
      return transactionsService.getAll(params);
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof transactionsService.create>[0]) =>
      transactionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      resetForm();
      toast.success(t('common.save'));
    },
    onError: () => toast.error('Error creating transaction'),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof transactionsService.update>[1];
    }) => transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      resetForm();
      toast.success(t('common.save'));
    },
    onError: () => toast.error('Error updating transaction'),
  });

  const deleteMutation = useMutation({
    mutationFn: transactionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      toast.success(t('common.delete'));
    },
    onError: () => toast.error('Error deleting transaction'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingTx(null);
    setFormType('EXPENSE');
    setFormCategoryId('');
    setFormAmount('');
    setFormDescription('');
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setFormCurrency('USD');
  };

  const startEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormCategoryId(tx.categoryId);
    setFormAmount(String(tx.amount));
    setFormDescription(tx.description);
    setFormDate(format(new Date(tx.date), 'yyyy-MM-dd'));
    setFormCurrency(tx.currency);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      type: formType,
      categoryId: formCategoryId,
      amount: parseFloat(formAmount),
      description: formDescription,
      date: formDate,
      currency: formCurrency,
    };

    if (editingTx) {
      updateMutation.mutate({ id: editingTx.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredCategories =
    categories?.filter((c: Category) => c.type === formType) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('transactions.title')}
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" /> {t('transactions.addNew')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'INCOME', 'EXPENSE'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setTypeFilter(type);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === type
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {type === ''
              ? t('transactions.all')
              : type === 'INCOME'
                ? t('transactions.income')
                : t('transactions.expense')}
          </button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editingTx
                ? t('transactions.editTransaction')
                : t('transactions.addNew')}
            </h2>
            <button
              onClick={resetForm}
              aria-label={t('common.close')}
            >
              <HiX className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.type')}
              </label>
              <select
                value={formType}
                onChange={(e) => {
                  setFormType(e.target.value as 'INCOME' | 'EXPENSE');
                  setFormCategoryId('');
                }}
                className="input-field"
              >
                <option value="EXPENSE">{t('transactions.expense')}</option>
                <option value="INCOME">{t('transactions.income')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.category')}
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- {t('common.select')} --</option>
                {filteredCategories.map((c: Category) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.amount')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.description')}
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.date')}
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? t('common.loading')
                  : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions list */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                {t('transactions.date')}
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                {t('transactions.category')}
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 hidden sm:table-cell">
                {t('transactions.description')}
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                {t('transactions.amount')}
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  {t('common.loading')}
                </td>
              </tr>
            ) : txData?.data.length ? (
              txData.data.map((tx: Transaction) => (
                <tr
                  key={tx.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-3 px-2 text-sm">
                    {format(new Date(tx.date), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    <span className="mr-1">{tx.category?.icon}</span>
                    {tx.category?.name}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-500 hidden sm:table-cell">
                    {tx.description}
                  </td>
                  <td
                    className={`py-3 px-2 text-sm text-right font-medium ${
                      tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}$
                    {Number(tx.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => startEdit(tx)}
                      className="text-gray-400 hover:text-indigo-600 mr-2"
                      aria-label={t('common.edit')}
                    >
                      <HiPencil className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('transactions.deleteConfirm')))
                          deleteMutation.mutate(tx.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={t('common.delete')}
                    >
                      <HiTrash className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  {t('common.noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {txData && txData.meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm"
            >
              &laquo; {t('common.prev')}
            </button>
            <span className="flex items-center text-sm text-gray-500">
              {page} / {txData.meta.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(txData.meta.totalPages, p + 1))
              }
              disabled={page === txData.meta.totalPages}
              className="btn-secondary text-sm"
            >
              {t('common.next')} &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
