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
      <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
        <HiShieldCheck className="w-7 h-7 text-amber-400" />
        {t('admin.title')}
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {TAB_CONFIG.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === tabItem.id
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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
              <p className="text-3xl font-bold text-amber-400">
                {stats.usersCount}
              </p>
              <p className="text-sm text-slate-400">{t('admin.totalUsers')}</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-emerald-400">
                {stats.transactionsCount}
              </p>
              <p className="text-sm text-slate-400">
                {t('admin.totalTransactions')}
              </p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-violet-400">
                {stats.activeApiKeys}
              </p>
              <p className="text-sm text-slate-400">
                {t('admin.activeApiKeys')}
              </p>
            </div>
          </div>

          {stats.recentUsers?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-100 mb-3">Recent Users</h3>
              <div className="space-y-2">
                {stats.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex justify-between text-sm py-1 border-b border-slate-800/60"
                  >
                    <span className="text-slate-300">{u.email}</span>
                    <span className="text-slate-500">
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
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">
                  {t('auth.email')}
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400 hidden sm:table-cell">
                  {t('auth.name')}
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">
                  Role
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">
                  Status
                </th>
                <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {usersData?.data?.map((u) => (
                <tr key={u.id} className="border-b border-slate-800/60">
                  <td className="py-3 px-2 text-sm text-slate-300">{u.email}</td>
                  <td className="py-3 px-2 text-sm text-slate-400 hidden sm:table-cell">
                    {u.name}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-violet-500/15 text-violet-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.isBlocked
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {u.isBlocked ? (
                      <button
                        onClick={() => unblockMutation.mutate(u.id)}
                        className="text-emerald-500 hover:text-emerald-400 mr-2 cursor-pointer transition-colors"
                        title={t('admin.unblock')}
                      >
                        <HiCheck className="w-4 h-4 inline" />
                      </button>
                    ) : (
                      <button
                        onClick={() => blockMutation.mutate(u.id)}
                        className="text-amber-500 hover:text-amber-400 mr-2 cursor-pointer transition-colors"
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
                      className="text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
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
                <p className="font-medium text-slate-200">{cat.name}</p>
                <p className="text-xs text-slate-500">{cat.type}</p>
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
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">
                  Code
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">
                  Name
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">
                  Symbol
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currencies?.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/60">
                  <td className="py-3 px-2 font-mono text-sm font-medium text-slate-200">
                    {c.code}
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-300">{c.name}</td>
                  <td className="py-3 px-2 text-lg text-slate-300">{c.symbol}</td>
                  <td className="py-3 px-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        c.isActive
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
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
