import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Topbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3">
      <div />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <div className="text-right">
          <div className="text-sm font-medium text-slate-700">{user?.name}</div>
          <div className="text-xs text-slate-400">{user?.role}</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button onClick={logout} className="btn-secondary !px-3 !py-1.5 text-sm">
          {t('nav.logout')}
        </button>
      </div>
    </header>
  );
}
