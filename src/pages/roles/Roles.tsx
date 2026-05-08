import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rolesApi } from '../../api';
import { Plus, Power, Pencil, X as XIcon, Save, RefreshCw } from 'lucide-react';
import { Spinner, ConfirmDialog } from '../../components/ui';

const formatNombre = (value: string) => {
  return value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]/g, '').substring(0, 50);
};

export default function Roles({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editId, setEditId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmData, setConfirmData] = useState<{ title?: string; msg: string; type?: 'primary' | 'danger'; action: () => void } | null>(null);

  const load = () => {
    setLoading(true);
    rolesApi.listar()
      .then(r => {
        const arr = Array.isArray(r?.data?.data) ? r.data.data : Array.isArray(r?.data) ? r.data : (r?.data?.items || []);
        setRoles(arr);
      })
      .catch(() => {
        setRoles([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleStatus = async (role: any) => {
    const isActive = role.activo;
    try {
      if (isActive) {
        await rolesApi.eliminar(role.id.toString());
        toast('Rol desactivado', 'success');
      } else {
        await rolesApi.actualizar(role.id.toString(), { activo: true });
        toast('Rol activado', 'success');
      }
      load();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message || 'Error al cambiar estado', 'error');
    }
  };

  const startEdit = (r: any) => {
    setEditId(r.id);
    setEditForm({
      nombre: r.nombre || r.name || ''
    });
  };

  const saveEdit = async (id: string | number) => {
    if (!editForm.nombre) {
      toast('Por favor complete el nombre', 'error');
      return;
    }
    setConfirmData({
      title: 'Guardar cambios',
      msg: '¿Estás seguro que deseas actualizar este rol?',
      action: async () => {
        setSavingEdit(true);
        try {
          await rolesApi.actualizar(id.toString(), editForm);
          toast('Rol actualizado exitosamente', 'success');
          setEditId(null);
          load();
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al actualizar rol', 'error');
        } finally {
          setSavingEdit(false);
        }
      }
    });
  };

  const filteredRoles = roles.filter(r => {
    if (!search) return true;
    const term = search.toLowerCase();
    const estadoStr = r.activo ? 'activo' : 'inactivo';
    return (
      (r.nombre || '').toLowerCase().includes(term) ||
      estadoStr.includes(term)
    );
  });

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Roles y Permisos</h3>
          <p className="text-slate-500 mt-1 italic">Gestión de roles y matrices de acceso</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => navigate('/roles/nuevo')}><Plus size={16} /></button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs w-full">
            <input 
              className="input w-full pr-8" 
              placeholder="Buscar…" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setSearch('')}
                title="Limpiar búsqueda"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>
          <button className="btn-ghost ml-auto" onClick={load} title="Actualizar"><RefreshCw size={16} /></button>
        </div>
        {loading ? <div className="flex justify-center py-16"><Spinner size={24} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Rol', 'Estado', 'Acciones'].map(h => <th key={h} className="th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredRoles.map(r => (
                  <React.Fragment key={r.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="td font-medium text-slate-900">{r.nombre || r.name}</td>
                      <td className="td">
                        <span className={r.activo ? 'badge badge-green' : 'badge badge-red'}>
                          {r.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <button 
                            className={`p-2 rounded-lg transition-colors ${r.nombre === 'SuperAdmin' ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : editId === r.id ? 'bg-violet-100 text-violet-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`} 
                            title={r.nombre === 'SuperAdmin' ? 'No se puede editar el rol SuperAdmin' : 'Editar'} 
                            disabled={r.nombre === 'SuperAdmin'}
                            onClick={() => editId === r.id ? setEditId(null) : startEdit(r)}
                          >
                            <Pencil size={16} />
                          </button>
                          {r.activo ? (
                            <button 
                              className={`p-2 rounded-lg transition-colors ${r.nombre === 'SuperAdmin' ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 text-red-600'}`} 
                              title={r.nombre === 'SuperAdmin' ? 'No se puede desactivar el rol SuperAdmin' : 'Desactivar'}
                              disabled={r.nombre === 'SuperAdmin'}
                              onClick={() => { 
                                setConfirmData({
                                  title: 'Desactivar Rol',
                                  msg: `¿Estás seguro que deseas desactivar el rol "${r.nombre}"? Sus usuarios asociados podrían perder acceso.`,
                                  type: 'danger',
                                  action: () => toggleStatus(r)
                                }); 
                              }}
                            ><Power size={16} /></button>
                          ) : (
                            <button className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Activar rol" onClick={() => { 
                              setConfirmData({
                                title: 'Activar rol',
                                msg: `¿Estás seguro que deseas activar el rol "${r.nombre}" nuevamente?`,
                                action: () => toggleStatus(r)
                              }); 
                            }}><Power size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {editId === r.id && (
                      <tr>
                        <td colSpan={4} className="bg-slate-50/50 border-b border-slate-100 p-0">
                          <div className="p-4 bg-white border border-slate-200 rounded-xl m-4 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4 text-sm">Editar</h4>
                            <div className="grid grid-cols-1 gap-4 mb-4 max-w-sm">
                              <div>
                                <label className="label text-xs">Nombre *</label>
                                <input className="input" value={editForm.nombre} onChange={e => setEditForm(p => ({ ...p, nombre: formatNombre(e.target.value) }))} maxLength={50} required />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" className="btn-secondary text-xs px-4 py-2" onClick={() => setEditId(null)}>Cancelar</button>
                              <button type="button" className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5" disabled={savingEdit} onClick={() => saveEdit(r.id)}>
                                {savingEdit ? <><Spinner size={14} /> Guardando…</> : 'Guardar'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredRoles.length === 0 && <tr><td colSpan={4} className="td text-center py-16 text-slate-400"><div className="text-3xl mb-2">🔑</div><p className="font-medium">Sin roles encontrados</p></td></tr>}
              </tbody>
            </table>
          </div>
        )}
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
