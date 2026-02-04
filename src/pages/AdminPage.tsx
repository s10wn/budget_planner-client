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

export default function AdminPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('statistics');

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <HiShieldCheck className="w-7 h-7 text-indigo-600" />
        {t('admin.title')}
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {TAB_CONFIG.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === tabItem.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
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
            <div className="card text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {stats.usersCount}
              </p>
              <p className="text-sm text-gray-500">{t('admin.totalUsers')}</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">
                {stats.transactionsCount}
              </p>
              <p className="text-sm text-gray-500">
                {t('admin.totalTransactions')}
              </p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-purple-600">
                {stats.activeApiKeys}
              </p>
              <p className="text-sm text-gray-500">
                {t('admin.activeApiKeys')}
              </p>
            </div>
          </div>

          {stats.recentUsers?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3">Recent Users</h3>
              <div className="space-y-2">
                {stats.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex justify-between text-sm py-1 border-b border-gray-50"
                  >
                    <span>{u.email}</span>
                    <span className="text-gray-400">
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
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                  {t('auth.email')}
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 hidden sm:table-cell">
                  {t('auth.name')}
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                  Role
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {usersData?.data?.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-3 px-2 text-sm">{u.email}</td>
                  <td className="py-3 px-2 text-sm hidden sm:table-cell">
                    {u.name}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.isBlocked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {u.isBlocked ? (
                      <button
                        onClick={() => unblockMutation.mutate(u.id)}
                        className="text-green-600 hover:text-green-800 mr-2"
                        title={t('admin.unblock')}
                      >
                        <HiCheck className="w-4 h-4 inline" />
                      </button>
                    ) : (
                      <button
                        onClick={() => blockMutation.mutate(u.id)}
                        className="text-yellow-600 hover:text-yellow-800 mr-2"
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
                      className="text-red-400 hover:text-red-600"
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
      )}

      {/* Default categories */}
      {tab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {defaultCategories?.map((cat) => (
            <div key={cat.id} className="card flex items-center gap-3 !p-4">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.type}</p>
              </div>
              <div
                className="w-4 h-4 rounded-full ml-auto shrink-0"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Currencies */}
      {tab === 'currencies' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                  Code
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                  Symbol
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currencies?.map((c) => (
                <tr key={c.id} className="border-b border-gray-50">
                  <td className="py-3 px-2 font-mono text-sm font-medium">
                    {c.code}
                  </td>
                  <td className="py-3 px-2 text-sm">{c.name}</td>
                  <td className="py-3 px-2 text-lg">{c.symbol}</td>
                  <td className="py-3 px-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        c.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
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
