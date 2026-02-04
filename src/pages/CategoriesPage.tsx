import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import type { Category } from '../types';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';

const EMOJI_OPTIONS = [
  '📦', '💰', '💻', '📈', '💵', '🛒', '🚗', '🏠', '💡', '🎬',
  '🏥', '📚', '🛍️', '🍽️', '📱', '✈️', '🎮', '🎵', '🐾', '🏋️',
];

const COLOR_OPTIONS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#06B6D4', '#D946EF', '#FB923C', '#64748B',
];

export default function CategoriesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState('#6B7280');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof categoriesService.create>[0]) =>
      categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      toast.success(t('common.save'));
    },
    onError: () => toast.error('Error creating category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      toast.success(t('common.save'));
    },
    onError: () => toast.error('Error updating category'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('common.delete'));
    },
    onError: () => toast.error('Error deleting category'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setName('');
    setType('EXPENSE');
    setIcon('📦');
    setColor('#6B7280');
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setColor(cat.color);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: { name, type, icon, color } });
    } else {
      createMutation.mutate({ name, type, icon, color });
    }
  };

  const incomeCategories =
    categories?.filter((c: Category) => c.type === 'INCOME') || [];
  const expenseCategories =
    categories?.filter((c: Category) => c.type === 'EXPENSE') || [];

  const renderCategoryCard = (cat: Category) => (
    <div key={cat.id} className="card flex items-center justify-between !p-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">{cat.icon}</span>
        <div className="min-w-0">
          <p className="font-medium truncate">{cat.name}</p>
          <p className="text-xs text-gray-400">
            {cat.isDefault ? t('categories.default') : t('categories.personal')}
          </p>
        </div>
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: cat.color }}
        />
      </div>
      {!cat.isDefault && (
        <div className="flex gap-1 shrink-0 ml-2">
          <button
            onClick={() => startEdit(cat)}
            className="text-gray-400 hover:text-indigo-600"
            aria-label={t('common.edit')}
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(t('common.confirm'))) deleteMutation.mutate(cat.id);
            }}
            className="text-gray-400 hover:text-red-600"
            aria-label={t('common.delete')}
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('categories.title')}
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" /> {t('categories.addNew')}
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editing ? t('common.edit') : t('categories.addNew')}
            </h2>
            <button
              onClick={resetForm}
              aria-label={t('common.close')}
            >
              <HiX className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categories.name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categories.type')}
                </label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as 'INCOME' | 'EXPENSE')
                  }
                  className="input-field"
                >
                  <option value="EXPENSE">{t('transactions.expense')}</option>
                  <option value="INCOME">{t('transactions.income')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('categories.icon')}
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-colors ${
                      icon === emoji
                        ? 'ring-2 ring-indigo-500 bg-indigo-50'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('categories.color')}
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-shadow ${
                      color === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? t('common.loading')
                : t('common.save')}
            </button>
          </form>
        </div>
      )}

      {/* Income categories */}
      <section>
        <h2 className="text-lg font-semibold text-green-600 mb-3">
          {t('transactions.income')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {incomeCategories.length > 0 ? (
            incomeCategories.map(renderCategoryCard)
          ) : (
            <p className="text-gray-400 col-span-full text-center py-4">
              {t('common.noData')}
            </p>
          )}
        </div>
      </section>

      {/* Expense categories */}
      <section>
        <h2 className="text-lg font-semibold text-red-600 mb-3">
          {t('transactions.expense')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {expenseCategories.length > 0 ? (
            expenseCategories.map(renderCategoryCard)
          ) : (
            <p className="text-gray-400 col-span-full text-center py-4">
              {t('common.noData')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
