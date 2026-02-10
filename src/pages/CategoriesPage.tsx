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
  '#E03E3E', '#D9730D', '#DFAB01', '#0F7B6C', '#0B6E99',
  '#6940A5', '#AD1A72', '#2EAADC', '#64473A', '#787774',
];

export default function CategoriesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState('#787774');

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
    setColor('#787774');
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
        <span className="text-xl shrink-0">{cat.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#37352F] truncate">{cat.name}</p>
          <p className="text-xs text-[#B4B4B0]">
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
            className="text-[#B4B4B0] hover:text-[#37352F] cursor-pointer transition-colors duration-150"
            aria-label={t('common.edit')}
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(t('common.confirm'))) deleteMutation.mutate(cat.id);
            }}
            className="text-[#B4B4B0] hover:text-[#E03E3E] cursor-pointer transition-colors duration-150"
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
        <h1 className="text-xl font-semibold text-[#37352F]">
          {t('categories.title')}
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-4 h-4" /> {t('categories.addNew')}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-[#37352F]">
              {editing ? t('common.edit') : t('categories.addNew')}
            </h2>
            <button
              onClick={resetForm}
              aria-label={t('common.close')}
              className="cursor-pointer"
            >
              <HiX className="w-4 h-4 text-[#B4B4B0] hover:text-[#37352F] transition-colors" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#37352F] mb-1.5">
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
                <label className="block text-sm font-medium text-[#37352F] mb-1.5">
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
              <label className="block text-sm font-medium text-[#37352F] mb-1.5">
                {t('categories.icon')}
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`w-9 h-9 text-lg rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      icon === emoji
                        ? 'ring-2 ring-[#2EAADC] bg-[#DDEBF1]'
                        : 'bg-[#F7F6F3] hover:bg-[#E9E9E7]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#37352F] mb-1.5">
                {t('categories.color')}
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-shadow duration-150 cursor-pointer ${
                      color === c ? 'ring-2 ring-offset-2 ring-offset-white ring-[#2EAADC]' : ''
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

      {/* Income */}
      <section>
        <h2 className="text-sm font-semibold text-[#0F7B6C] uppercase tracking-wider mb-3">
          {t('transactions.income')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {incomeCategories.length > 0 ? (
            incomeCategories.map(renderCategoryCard)
          ) : (
            <p className="text-[#B4B4B0] col-span-full text-center py-4 text-sm">
              {t('common.noData')}
            </p>
          )}
        </div>
      </section>

      {/* Expense */}
      <section>
        <h2 className="text-sm font-semibold text-[#E03E3E] uppercase tracking-wider mb-3">
          {t('transactions.expense')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {expenseCategories.length > 0 ? (
            expenseCategories.map(renderCategoryCard)
          ) : (
            <p className="text-[#B4B4B0] col-span-full text-center py-4 text-sm">
              {t('common.noData')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
