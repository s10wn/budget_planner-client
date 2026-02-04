import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
      toast.success(t('auth.welcomeBack'));
    } catch {
      toast.error(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#37352F] tracking-tight">Budget Planner</h1>
          <p className="text-[#787774] mt-2 text-sm">{t('auth.loginTitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-[#37352F] mb-1.5">
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              autoComplete="email"
              placeholder="demo@budget-planner.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-[#37352F] mb-1.5">
              {t('auth.password')}
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoComplete="current-password"
              placeholder="user123"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.login')}
          </button>
          <p className="text-center text-sm text-[#787774]">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-[#2EAADC] hover:underline transition-colors">
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
