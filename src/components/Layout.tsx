import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  HiHome,
  HiCreditCard,
  HiTag,
  HiChartPie,
  HiDocumentReport,
  HiKey,
  HiCog,
  HiShieldCheck,
  HiMenu,
  HiX,
  HiLogout,
  HiGlobe,
} from 'react-icons/hi';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pl' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { to: '/', icon: HiHome, label: t('nav.dashboard') },
    { to: '/transactions', icon: HiCreditCard, label: t('nav.transactions') },
    { to: '/categories', icon: HiTag, label: t('nav.categories') },
    { to: '/budgets', icon: HiChartPie, label: t('nav.budgets') },
    { to: '/reports', icon: HiDocumentReport, label: t('nav.reports') },
    { to: '/api-keys', icon: HiKey, label: t('nav.apiKeys') },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/admin', icon: HiShieldCheck, label: t('nav.admin') });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
      isActive
        ? 'bg-amber-500/15 text-amber-400 font-medium'
        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
    }`;

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
          <h1 className="text-xl font-bold text-amber-400 tracking-tight">BudgetPlanner</h1>
          <button
            className="lg:hidden text-slate-400 hover:text-slate-200 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4 space-y-1">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
          >
            <HiGlobe className="w-5 h-5" />
            {i18n.language === 'en' ? 'Polski' : 'English'}
          </button>
          <NavLink
            to="/settings"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <HiCog className="w-5 h-5" />
            {t('nav.settings')}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all cursor-pointer"
          >
            <HiLogout className="w-5 h-5" />
            {t('auth.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            className="lg:hidden text-slate-400 hover:text-slate-200 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <HiMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <div
              className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center font-semibold text-sm"
              aria-hidden="true"
            >
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
