import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [language, setLanguage] = useState(user?.language ?? 'en');
  const [currency, setCurrency] = useState(user?.currencyCode ?? 'USD');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        name,
        language,
        currencyCode: currency,
      });
      updateUser(updated);
      i18n.changeLanguage(language);
      toast.success(t('common.save'));
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-[#37352F]">
        {t('settings.title')}
      </h1>

      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-[#37352F]">{t('settings.profile')}</h2>
        <div>
          <label
            htmlFor="settings-name"
            className="block text-sm font-medium text-[#37352F] mb-1.5"
          >
            {t('auth.name')}
          </label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label
            htmlFor="settings-email"
            className="block text-sm font-medium text-[#37352F] mb-1.5"
          >
            {t('auth.email')}
          </label>
          <input
            id="settings-email"
            type="email"
            value={user?.email ?? ''}
            className="input-field !bg-[#F7F6F3] text-[#B4B4B0]"
            disabled
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-[#37352F]">{t('settings.language')}</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="input-field"
          aria-label={t('settings.language')}
        >
          <option value="en">English</option>
          <option value="pl">Polski</option>
        </select>
      </div>

      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-[#37352F]">{t('settings.currency')}</h2>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="input-field"
          aria-label={t('settings.currency')}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (&euro;)</option>
          <option value="GBP">GBP (&pound;)</option>
          <option value="PLN">PLN (zl)</option>
          <option value="RUB">RUB (&#8381;)</option>
          <option value="UAH">UAH (&#8372;)</option>
        </select>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? t('common.loading') : t('common.save')}
      </button>
    </div>
  );
}
