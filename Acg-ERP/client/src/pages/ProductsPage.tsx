import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { Category, Product } from '../lib/types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const empty = {
  sku: '',
  nameEn: '',
  nameAr: '',
  description: '',
  unit: 'pcs',
  costPrice: 0,
  salePrice: 0,
  reorderLevel: 0,
  categoryId: '',
  isActive: true,
};

export function ProductsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const qc = useQueryClient();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () =>
      (await api.get<Product[]>('/products', { params: { search: search || undefined } })).data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, categoryId: form.categoryId || null };
      if (editing) return api.put(`/products/${editing.id}`, payload);
      return api.post('/products', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      sku: p.sku,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      description: p.description ?? '',
      unit: p.unit,
      costPrice: Number(p.costPrice),
      salePrice: Number(p.salePrice),
      reorderLevel: p.reorderLevel,
      categoryId: p.categoryId ?? '',
      isActive: p.isActive,
    });
    setOpen(true);
  }
  function closeModal() {
    setOpen(false);
    setEditing(null);
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-800">{t('product.title')}</h1>
        <div className="flex items-center gap-2">
          <input
            className="input !w-56"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {canEdit && (
            <button className="btn-primary whitespace-nowrap" onClick={openCreate}>
              + {t('product.addProduct')}
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase text-slate-400 border-b border-slate-200 bg-slate-50">
              <th className="table-cell text-start">{t('product.sku')}</th>
              <th className="table-cell text-start">{t('product.name')}</th>
              <th className="table-cell text-start">{t('product.category')}</th>
              <th className="table-cell text-start">{t('product.salePrice')}</th>
              <th className="table-cell text-start">{t('product.stock')}</th>
              {canEdit && <th className="table-cell text-start">{t('common.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="table-cell text-slate-400" colSpan={6}>{t('common.loading')}</td></tr>
            )}
            {!isLoading && products.length === 0 && (
              <tr><td className="table-cell text-slate-400" colSpan={6}>{t('common.noData')}</td></tr>
            )}
            {products.map((p) => {
              const low = p.reorderLevel > 0 && (p.totalStock ?? 0) <= p.reorderLevel;
              return (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="table-cell font-mono text-slate-500">{p.sku}</td>
                  <td className="table-cell font-medium">{isAr ? p.nameAr : p.nameEn}</td>
                  <td className="table-cell text-slate-500">
                    {p.category ? (isAr ? p.category.nameAr : p.category.nameEn) : t('product.noCategory')}
                  </td>
                  <td className="table-cell">{Number(p.salePrice).toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      low ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {p.totalStock ?? 0} {p.unit}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button className="text-brand-600 hover:underline text-sm" onClick={() => openEdit(p)}>
                          {t('common.edit')}
                        </button>
                        <button
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => {
                            if (confirm(t('common.confirmDelete'))) deleteMutation.mutate(p.id);
                          }}
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editing ? t('product.editProduct') : t('product.addProduct')}
        onClose={closeModal}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('product.sku')}</label>
              <input className="input" value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('product.category')}</label>
              <select className="input" value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">{t('product.noCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{isAr ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('product.nameEn')}</label>
              <input className="input" value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('product.nameAr')}</label>
              <input className="input" dir="rtl" value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('product.costPrice')}</label>
              <input type="number" step="0.01" min="0" className="input" value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">{t('product.salePrice')}</label>
              <input type="number" step="0.01" min="0" className="input" value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">{t('product.unit')}</label>
              <input className="input" value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('product.reorderLevel')}</label>
              <input type="number" min="0" className="input" value={form.reorderLevel}
                onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">{t('product.description')}</label>
            <textarea className="input" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={saveMutation.isPending}>
              {t('common.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
