import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
      toast.success(t('auth.accountCreated'));
    } catch {
      toast.error(t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#37352F] tracking-tight">Budget Planner</h1>
          <p className="text-[#787774] mt-2 text-sm">{t('auth.registerTitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-[#37352F] mb-1.5">
              {t('auth.name')}
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              autoComplete="name"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-[#37352F] mb-1.5">
              {t('auth.email')}
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-[#37352F] mb-1.5">
              {t('auth.password')}
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.register')}
          </button>
          <p className="text-center text-sm text-[#787774]">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-[#2EAADC] hover:underline transition-colors">
              {t('auth.login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
