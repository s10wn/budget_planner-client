import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysService } from '../services/api-keys.service';
import type { ApiKey } from '../types';
import toast from 'react-hot-toast';
import {
  HiPlus,
  HiTrash,
  HiBan,
  HiClipboardCopy,
} from 'react-icons/hi';

export default function ApiKeysPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState('');

  const { data: apiKeys } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => apiKeysService.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setShowForm(false);
      setKeyName('');
      toast.success(t('apiKeys.create'));
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiKeysService.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success(t('apiKeys.revoke'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiKeysService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success(t('common.delete'));
    },
  });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Copied to clipboard');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    createMutation.mutate(keyName.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">
          {t('apiKeys.title')}
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" /> {t('apiKeys.create')}
        </button>
      </div>

      {/* Info box */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 text-sm text-violet-300">
        <p className="font-medium mb-1">Public API Documentation</p>
        <p className="text-violet-400">
          Use your API key in the{' '}
          <code className="bg-violet-500/20 px-1.5 py-0.5 rounded text-violet-300">x-api-key</code> header.
          Rate limit: 100 requests/hour.
        </p>
        <p className="mt-1 text-violet-400">
          API Base URL:{' '}
          <code className="bg-violet-500/20 px-1.5 py-0.5 rounded text-violet-300">/api/v1/</code>
        </p>
        <p className="text-violet-400">
          Swagger docs:{' '}
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-violet-300 hover:text-violet-200"
          >
            /api/docs
          </a>
        </p>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="card flex flex-col sm:flex-row gap-4 items-end"
        >
          <div className="flex-1 w-full">
            <label
              htmlFor="api-key-name"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              {t('apiKeys.name')}
            </label>
            <input
              id="api-key-name"
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="input-field"
              placeholder="My Application"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={createMutation.isPending}
          >
            {t('common.save')}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {apiKeys?.map((k) => (
          <div
            key={k.id}
            className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 !p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-slate-200">{k.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    k.isActive
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {k.isActive ? t('apiKeys.active') : t('apiKeys.revoked')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-slate-800 px-2 py-1 rounded font-mono text-slate-400 truncate max-w-[300px]">
                  {k.key}
                </code>
                <button
                  onClick={() => copyKey(k.key)}
                  className="text-slate-500 hover:text-amber-400 cursor-pointer transition-colors"
                  title="Copy to clipboard"
                >
                  <HiClipboardCopy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('apiKeys.requests')}: {k.requestsCount} |{' '}
                {t('apiKeys.lastUsed')}:{' '}
                {k.lastUsed
                  ? new Date(k.lastUsed).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {k.isActive && (
                <button
                  onClick={() => revokeMutation.mutate(k.id)}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  <HiBan className="w-4 h-4" /> {t('apiKeys.revoke')}
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm(t('common.confirm')))
                    deleteMutation.mutate(k.id);
                }}
                className="btn-danger text-sm flex items-center gap-1"
              >
                <HiTrash className="w-4 h-4" /> {t('common.delete')}
              </button>
            </div>
          </div>
        ))}

        {(!apiKeys || apiKeys.length === 0) && (
          <div className="card text-center text-slate-500 py-8">
            {t('common.noData')}
          </div>
        )}
      </div>
    </div>
  );
}
