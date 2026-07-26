import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { DashboardStats } from '../lib/types';

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get<DashboardStats>('/dashboard/stats')).data,
  });

  if (isLoading || !data) {
    return <div className="text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t('dashboard.products')} value={data.productCount} icon="📦" />
        <StatCard label={t('dashboard.categories')} value={data.categoryCount} icon="🏷️" />
        <StatCard label={t('dashboard.warehouses')} value={data.warehouseCount} icon="🏬" />
        <StatCard label={t('dashboard.totalUnits')} value={data.totalUnits.toLocaleString()} icon="🔢" />
        <StatCard
          label={t('dashboard.inventoryValue')}
          value={data.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          icon="💰"
        />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          {t('dashboard.lowStock')}
        </h2>
        {data.lowStock.length === 0 ? (
          <p className="text-sm text-slate-400">{t('dashboard.noLowStock')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="text-xs uppercase text-slate-400 border-b border-slate-200">
                  <th className="table-cell text-start">{t('product.sku')}</th>
                  <th className="table-cell text-start">{t('product.name')}</th>
                  <th className="table-cell text-start">{t('product.stock')}</th>
                  <th className="table-cell text-start">{t('dashboard.reorderLevel')}</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStock.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="table-cell font-mono text-slate-500">{p.sku}</td>
                    <td className="table-cell">{isAr ? p.nameAr : p.nameEn}</td>
                    <td className="table-cell">
                      <span className="inline-block rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold">
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="table-cell text-slate-500">{p.reorderLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
