import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { rolesApi } from '../../api';
import { X } from 'lucide-react';
import { Spinner, ConfirmDialog } from '../../components/ui';

const formatNombre = (value: string) => {
  return value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]/g, '').substring(0, 50);
};

export default function RolCrear({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '' });
  const [confirmData, setConfirmData] = useState<{ title?: string; msg: string; type?: 'primary' | 'danger'; action: () => void } | null>(null);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setConfirmData({
      title: 'Crear rol',
      msg: '¿Estás seguro que deseas registrar este nuevo rol?',
      action: async () => {
        setSaving(true);
        try {
          await rolesApi.crear(form);
          toast('Rol creado exitosamente', 'success');
          navigate('/roles');
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al crear rol', 'error');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/roles')} className="btn-ghost btn-icon text-slate-500 hover:text-slate-900"><X size={20} /></button>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Nuevo Rol</h3>
          <p className="text-slate-500 mt-1 italic">Ingrese los detalles para registrar un nuevo rol.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="card p-5">
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: formatNombre(e.target.value) }))} placeholder="Ej. Supervisor" maxLength={50} required />
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => navigate('/roles')}>Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? <><Spinner /> Guardando…</> : 'Guardar'}</button>
            </div>
          </form>
        </div>
      </div>

      {confirmData && (
        <ConfirmDialog
          title={confirmData.title}
          msg={confirmData.msg}
          type={confirmData.type}
          onConfirm={confirmData.action}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </div>
  );
}
