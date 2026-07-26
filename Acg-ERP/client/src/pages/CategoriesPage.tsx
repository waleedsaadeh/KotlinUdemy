import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { Category } from '../lib/types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const empty = { nameEn: '', nameAr: '', description: '' };

export function CategoriesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return api.put(`/categories/${editing.id}`, form);
      return api.post('/categories', form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(c: Category) {
    setEditing(c);
    setForm({ nameEn: c.nameEn, nameAr: c.nameAr, description: c.description ?? '' });
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{t('category.title')}</h1>
        {canEdit && (
          <button className="btn-primary" onClick={openCreate}>
            + {t('category.addCategory')}
          </button>
        )}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase text-slate-400 border-b border-slate-200 bg-slate-50">
              <th className="table-cell text-start">{t('category.nameEn')}</th>
              <th className="table-cell text-start">{t('category.nameAr')}</th>
              <th className="table-cell text-start">{t('category.productCount')}</th>
              {canEdit && <th className="table-cell text-start">{t('common.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="table-cell text-slate-400" colSpan={4}>{t('common.loading')}</td></tr>
            )}
            {!isLoading && categories.length === 0 && (
              <tr><td className="table-cell text-slate-400" colSpan={4}>{t('common.noData')}</td></tr>
            )}
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="table-cell font-medium">{c.nameEn}</td>
                <td className="table-cell">{c.nameAr}</td>
                <td className="table-cell text-slate-500">{c._count?.products ?? 0}</td>
                {canEdit && (
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button className="text-brand-600 hover:underline text-sm" onClick={() => openEdit(c)}>
                        {t('common.edit')}
                      </button>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => {
                          if (confirm(t('common.confirmDelete'))) deleteMutation.mutate(c.id);
                        }}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editing ? t('category.editCategory') : t('category.addCategory')}
        onClose={closeModal}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">{t('category.nameEn')}</label>
            <input className="input" value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('category.nameAr')}</label>
            <input className="input" dir="rtl" value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('category.description')}</label>
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
