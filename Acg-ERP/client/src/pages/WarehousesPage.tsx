import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { Warehouse } from '../lib/types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const empty = { nameEn: '', nameAr: '', location: '', isActive: true };

export function WarehousesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form, setForm] = useState(empty);

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => (await api.get<Warehouse[]>('/warehouses')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return api.put(`/warehouses/${editing.id}`, form);
      return api.post('/warehouses', form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/warehouses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(w: Warehouse) {
    setEditing(w);
    setForm({ nameEn: w.nameEn, nameAr: w.nameAr, location: w.location ?? '', isActive: w.isActive });
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
        <h1 className="text-2xl font-bold text-slate-800">{t('warehouse.title')}</h1>
        {canEdit && (
          <button className="btn-primary" onClick={openCreate}>
            + {t('warehouse.addWarehouse')}
          </button>
        )}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase text-slate-400 border-b border-slate-200 bg-slate-50">
              <th className="table-cell text-start">{t('warehouse.nameEn')}</th>
              <th className="table-cell text-start">{t('warehouse.nameAr')}</th>
              <th className="table-cell text-start">{t('warehouse.location')}</th>
              <th className="table-cell text-start">{t('warehouse.status')}</th>
              {canEdit && <th className="table-cell text-start">{t('common.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="table-cell text-slate-400" colSpan={5}>{t('common.loading')}</td></tr>
            )}
            {!isLoading && warehouses.length === 0 && (
              <tr><td className="table-cell text-slate-400" colSpan={5}>{t('common.noData')}</td></tr>
            )}
            {warehouses.map((w) => (
              <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="table-cell font-medium">{w.nameEn}</td>
                <td className="table-cell">{w.nameAr}</td>
                <td className="table-cell text-slate-500">{w.location || '—'}</td>
                <td className="table-cell">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    w.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {w.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                </td>
                {canEdit && (
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button className="text-brand-600 hover:underline text-sm" onClick={() => openEdit(w)}>
                        {t('common.edit')}
                      </button>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => {
                          if (confirm(t('common.confirmDelete'))) deleteMutation.mutate(w.id);
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
        title={editing ? t('warehouse.editWarehouse') : t('warehouse.addWarehouse')}
        onClose={closeModal}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">{t('warehouse.nameEn')}</label>
            <input className="input" value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('warehouse.nameAr')}</label>
            <input className="input" dir="rtl" value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('warehouse.location')}</label>
            <input className="input" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            {t('common.active')}
          </label>
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
