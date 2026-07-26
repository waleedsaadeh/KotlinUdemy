import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const links = [
  { to: '/', key: 'dashboard', icon: '📊', end: true },
  { to: '/products', key: 'products', icon: '📦' },
  { to: '/categories', key: 'categories', icon: '🏷️' },
  { to: '/warehouses', key: 'warehouses', icon: '🏬' },
];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-64 shrink-0 bg-brand-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="text-xl font-bold">{t('app.name')}</div>
        <div className="text-xs text-brand-200 mt-0.5">{t('app.tagline')}</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-brand-100 hover:bg-white/10'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span>{t(`nav.${link.key}`)}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 text-xs text-brand-300 border-t border-white/10">
        v0.1.0
      </div>
    </aside>
  );
}
