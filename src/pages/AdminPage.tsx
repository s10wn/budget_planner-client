import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import type { Category, Currency } from '../types';
import toast from 'react-hot-toast';
import {
  HiUsers,
  HiCollection,
  HiCurrencyDollar,
  HiChartBar,
  HiShieldCheck,
  HiTrash,
  HiBan,
  HiCheck,
  HiPlus,
  HiX,
} from 'react-icons/hi';

type Tab = 'statistics' | 'users' | 'categories' | 'currencies';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  createdAt: string;
}

interface AdminStats {
  usersCount: number;
  transactionsCount: number;
  activeApiKeys: number;
  recentUsers: AdminUser[];
}

const TAB_CONFIG: { id: Tab; icon: typeof HiChartBar; labelKey: string }[] = [
  { id: 'statistics', icon: HiChartBar, labelKey: 'admin.statistics' },
  { id: 'users', icon: HiUsers, labelKey: 'admin.users' },
  { id: 'categories', icon: HiCollection, labelKey: 'admin.categories' },
  { id: 'currencies', icon: HiCurrencyDollar, labelKey: 'admin.currencies' },
];

const EMOJI_OPTIONS = [
  '📦', '💰', '💻', '📈', '💵', '🛒', '🚗', '🏠', '💡', '🎬',
  '🏥', '📚', '🛍️', '🍽️', '📱', '✈️', '🎮', '🎵', '🐾', '🏋️',
];

const COLOR_OPTIONS = [
  '#E03E3E', '#D9730D', '#DFAB01', '#0F7B6C', '#0B6E99',
  '#6940A5', '#AD1A72', '#2EAADC', '#64473A', '#787774',
];

export default function AdminPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('statistics');

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'USER' | 'ADMIN'>('USER');

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [catIcon, setCatIcon] = useState('📦');
  const [catColor, setCatColor] = useState('#787774');

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStatistics(),
    enabled: tab === 'statistics',
  });

  const { data: usersData } = useQuery<{ data: AdminUser[] }>({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers(),
    enabled: tab === 'users',
  });

  const { data: defaultCategories } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => adminService.getDefaultCategories(),
    enabled: tab === 'categories',
  });

  const { data: currencies } = useQuery<Currency[]>({
    queryKey: ['admin-currencies'],
    queryFn: () => adminService.getCurrencies(),
    enabled: tab === 'currencies',
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => adminService.blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('admin.block'));
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminService.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('admin.unblock'));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('common.delete'));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name?: string; role?: 'USER' | 'ADMIN' }) =>
      adminService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowUserForm(false);
      setUserEmail('');
      setUserPassword('');
      setUserName('');
      setUserRole('USER');
      toast.success(t('common.save'));
    },
    onError: () => toast.error('User with this email already exists'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; type: 'INCOME' | 'EXPENSE'; icon: string; color: string }) =>
      adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowCategoryForm(false);
      setCatName('');
      setCatType('EXPENSE');
      setCatIcon('📦');
      setCatColor('#787774');
      toast.success(t('common.save'));
    },
    onError: () => toast.error('Error creating category'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(t('common.delete'));
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate({ email: userEmail, password: userPassword, name: userName, role: userRole });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate({ name: catName, type: catType, icon: catIcon, color: catColor });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#37352F] flex items-center gap-2">
        <HiShieldCheck className="w-5 h-5 text-[#6940A5]" />
        {t('admin.title')}
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#E9E9E7] pb-2">
        {TAB_CONFIG.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
              tab === tabItem.id
                ? 'bg-[#37352F] text-white'
                : 'text-[#787774] hover:bg-[#F7F6F3] hover:text-[#37352F]'
            }`}
          >
            <tabItem.icon className="w-4 h-4" />
            {t(tabItem.labelKey)}
          </button>
        ))}
      </div>

      {/* Statistics */}
      {tab === 'statistics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card text-center border-l-4 border-l-[#2EAADC]">
              <p className="text-2xl font-semibold text-[#37352F]">
                {stats.usersCount}
              </p>
              <p className="text-sm text-[#787774]">{t('admin.totalUsers')}</p>
            </div>
            <div className="card text-center border-l-4 border-l-[#0F7B6C]">
              <p className="text-2xl font-semibold text-[#37352F]">
                {stats.transactionsCount}
              </p>
              <p className="text-sm text-[#787774]">
                {t('admin.totalTransactions')}
              </p>
            </div>
            <div className="card text-center border-l-4 border-l-[#6940A5]">
              <p className="text-2xl font-semibold text-[#37352F]">
                {stats.activeApiKeys}
              </p>
              <p className="text-sm text-[#787774]">
                {t('admin.activeApiKeys')}
              </p>
            </div>
          </div>

          {stats.recentUsers?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-[#37352F] mb-3">Recent Users</h3>
              <div className="space-y-2">
                {stats.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex justify-between text-sm py-1.5 border-b border-[#E9E9E7] last:border-0"
                  >
                    <span className="text-[#37352F]">{u.email}</span>
                    <span className="text-[#B4B4B0]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="btn-primary flex items-center gap-2"
            >
              <HiPlus className="w-4 h-4" /> {t('admin.createUser')}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleCreateUser} className="card space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-[#37352F]">{t('admin.createUser')}</h3>
                <button type="button" onClick={() => setShowUserForm(false)} className="cursor-pointer">
                  <HiX className="w-4 h-4 text-[#B4B4B0] hover:text-[#37352F]" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#37352F] mb-1.5">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#37352F] mb-1.5">{t('auth.password')}</label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#37352F] mb-1.5">{t('auth.name')}</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#37352F] mb-1.5">Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as 'USER' | 'ADMIN')}
                    className="input-field"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          )}

          <div className="card overflow-x-auto !p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E9E9E7]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider">
                  {t('auth.email')}
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider hidden sm:table-cell">
                  {t('auth.name')}
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {usersData?.data?.map((u) => (
                <tr key={u.id} className="border-b border-[#E9E9E7] last:border-0">
                  <td className="py-3 px-4 text-sm text-[#37352F]">{u.email}</td>
                  <td className="py-3 px-4 text-sm text-[#787774] hidden sm:table-cell">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-[#EAE4F2] text-[#6940A5]'
                          : 'bg-[#F7F6F3] text-[#787774]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        u.isBlocked
                          ? 'bg-[#FBE4E4] text-[#E03E3E]'
                          : 'bg-[#DDEDEA] text-[#0F7B6C]'
                      }`}
                    >
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.isBlocked ? (
                      <button
                        onClick={() => unblockMutation.mutate(u.id)}
                        className="text-[#0F7B6C] hover:text-[#0a6356] mr-2 cursor-pointer transition-colors duration-150"
                        title={t('admin.unblock')}
                      >
                        <HiCheck className="w-4 h-4 inline" />
                      </button>
                    ) : (
                      <button
                        onClick={() => blockMutation.mutate(u.id)}
                        className="text-[#D9730D] hover:text-[#c0650b] mr-2 cursor-pointer transition-colors duration-150"
                        title={t('admin.block')}
                      >
                        <HiBan className="w-4 h-4 inline" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(t('common.confirm')))
                          deleteUserMutation.mutate(u.id);
                      }}
                      className="text-[#B4B4B0] hover:text-[#E03E3E] cursor-pointer transition-colors duration-150"
                      title={t('common.delete')}
                    >
                      <HiTrash className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Default categories */}
      {tab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="btn-primary flex items-center gap-2"
            >
              <HiPlus className="w-4 h-4" /> {t('categories.addNew')}
            </button>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleCreateCategory} className="card space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-[#37352F]">{t('categories.addNew')}</h3>
                <button type="button" onClick={() => setShowCategoryForm(false)} className="cursor-pointer">
                  <HiX className="w-4 h-4 text-[#B4B4B0] hover:text-[#37352F]" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#37352F] mb-1.5">{t('categories.name')}</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#37352F] mb-1.5">{t('categories.type')}</label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as 'INCOME' | 'EXPENSE')}
                    className="input-field"
                  >
                    <option value="EXPENSE">{t('transactions.expense')}</option>
                    <option value="INCOME">{t('transactions.income')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#37352F] mb-1.5">{t('categories.icon')}</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setCatIcon(emoji)}
                      className={`w-9 h-9 text-lg rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer ${
                        catIcon === emoji
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
                <label className="block text-sm font-medium text-[#37352F] mb-1.5">{t('categories.color')}</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCatColor(c)}
                      className={`w-7 h-7 rounded-full transition-shadow duration-150 cursor-pointer ${
                        catColor === c ? 'ring-2 ring-offset-2 ring-offset-white ring-[#2EAADC]' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {defaultCategories?.map((cat) => (
              <div key={cat.id} className="card flex items-center gap-3 !p-4">
                <span className="text-xl">{cat.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#37352F]">{cat.name}</p>
                  <p className="text-xs text-[#B4B4B0]">{cat.type}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <button
                  onClick={() => {
                    if (confirm(t('common.confirm'))) deleteCategoryMutation.mutate(cat.id);
                  }}
                  className="text-[#B4B4B0] hover:text-[#E03E3E] cursor-pointer transition-colors duration-150 shrink-0"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currencies */}
      {tab === 'currencies' && (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E9E9E7]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider">
                  Code
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider">
                  Symbol
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currencies?.map((c) => (
                <tr key={c.id} className="border-b border-[#E9E9E7] last:border-0">
                  <td className="py-3 px-4 font-mono text-sm font-medium text-[#37352F]">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#787774]">{c.name}</td>
                  <td className="py-3 px-4 text-lg text-[#37352F]">{c.symbol}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        c.isActive
                          ? 'bg-[#DDEDEA] text-[#0F7B6C]'
                          : 'bg-[#F7F6F3] text-[#B4B4B0]'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
