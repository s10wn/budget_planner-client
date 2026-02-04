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
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
      isActive
        ? 'bg-[#F7F6F3] text-[#37352F] font-semibold'
        : 'text-[#787774] hover:bg-[#F7F6F3] hover:text-[#37352F]'
    }`;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-[#FBFBFA] border-r border-[#E9E9E7] flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[#E9E9E7]">
          <h1 className="text-sm font-semibold text-[#37352F] tracking-tight">Budget Planner</h1>
          <button
            className="lg:hidden text-[#787774] hover:text-[#37352F] cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#E9E9E7] p-2 space-y-0.5">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[#787774] hover:bg-[#F7F6F3] hover:text-[#37352F] rounded-md transition-all duration-150 cursor-pointer"
          >
            <HiGlobe className="w-[18px] h-[18px]" />
            {i18n.language === 'en' ? 'Polski' : 'English'}
          </button>
          <NavLink
            to="/settings"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <HiCog className="w-[18px] h-[18px]" />
            {t('nav.settings')}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[#E03E3E] hover:bg-[#FBE4E4] rounded-md transition-all duration-150 cursor-pointer"
          >
            <HiLogout className="w-[18px] h-[18px]" />
            {t('auth.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E9E9E7] h-14 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            className="lg:hidden text-[#787774] hover:text-[#37352F] cursor-pointer"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <HiMenu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-[#787774]">{user?.email}</span>
            <div
              className="w-8 h-8 bg-[#2EAADC] text-white rounded-full flex items-center justify-center font-medium text-sm"
              aria-hidden="true"
            >
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
