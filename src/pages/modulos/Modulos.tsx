import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modulesApi } from '../../api';
import { Plus, RefreshCw, Power, Pencil, X as XIcon, Save, Trash2 } from 'lucide-react';
import { Spinner, ConfirmDialog } from '../../components/ui';

const formatNombre = (value: string) => {
  return value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]/g, '').substring(0, 50);
};

export default function Modulos({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [confirmData, setConfirmData] = useState<{ title?: string; msg: string; type?: 'primary' | 'danger'; action: () => void } | null>(null);

  // Edit module state
  const [editId, setEditId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Inline submodule edit state
  const [editSubId, setEditSubId] = useState<number | 'new' | null>(null);
  const [subForm, setSubForm] = useState({ nombre: '', moduloId: null as number | null });
  const [savingSub, setSavingSub] = useState(false);

  const load = () => { 
    setLoading(true); 
    modulesApi.listarTodos()
      .then((r) => {
        const data = r.data.data || r.data || [];
        setMods(data.sort((a: any, b: any) => {
          if (a.activo !== b.activo) return (b.activo === true ? 1 : 0) - (a.activo === true ? 1 : 0);
          return (a.nombre || '').localeCompare(b.nombre || '');
        }));
      })
      .catch(() => setMods([]))
      .finally(() => setLoading(false)); 
  };
  
  useEffect(load, []);

  const toggleStatus = async (mod: any) => {
    try {
      if (mod.activo) {
        await modulesApi.eliminar(mod.id.toString());
        toast('Módulo desactivado con éxito', 'success');
      } else {
        await modulesApi.actualizar(mod.id.toString(), { activo: true });
        toast('Módulo activado con éxito', 'success');
      }
      load();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message || 'Error al cambiar estado', 'error');
    }
  };

  const startEdit = (m: any) => {
    setEditId(m.id);
    setEditForm({ nombre: m.nombre || '' });
    setEditSubId(null);
  };

  const saveEdit = async (id: string | number) => {
    if (!editForm.nombre) {
      toast('Por favor complete el nombre', 'error');
      return;
    }
    setConfirmData({
      title: 'Guardar cambios',
      msg: '¿Estás seguro que deseas actualizar este módulo?',
      action: async () => {
        setSavingEdit(true);
        try {
          await modulesApi.actualizar(id.toString(), editForm);
          toast('Módulo actualizado con éxito', 'success');
          load();
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al actualizar módulo', 'error');
        } finally {
          setSavingEdit(false);
        }
      }
    });
  };

  const toggleSubStatus = (sub: any) => {
    setConfirmData({
      title: sub.activo ? 'Desactivar submódulo' : 'Activar submódulo',
      msg: `¿Estás seguro que deseas ${sub.activo ? 'desactivar' : 'activar'} el submódulo "${sub.nombre}"?`,
      type: sub.activo ? 'danger' : 'primary',
      action: async () => {
        try {
          await modulesApi.actualizarSubmodulo(sub.id.toString(), { activo: !sub.activo });
          toast(sub.activo ? 'Submódulo desactivado con éxito' : 'Submódulo activado con éxito', 'success');
          load();
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al cambiar estado', 'error');
        }
      }
    });
  };

  const guardarSubmodulo = async (e: React.FormEvent, subId: number | null) => {
    e.preventDefault();
    if (!subForm.moduloId) return;
    setConfirmData({
      title: subId ? 'Guardar cambios' : 'Crear submódulo',
      msg: subId ? '¿Estás seguro que deseas actualizar este submódulo?' : '¿Estás seguro que deseas registrar este nuevo submódulo?',
      action: async () => {
        setSavingSub(true);
        try {
          if (subId) {
            await modulesApi.actualizarSubmodulo(subId.toString(), { nombre: subForm.nombre });
            toast('Submódulo actualizado con éxito', 'success');
          } else {
            await modulesApi.crearSubmodulo({ nombre: subForm.nombre, moduloId: subForm.moduloId });
            toast('Submódulo creado con éxito', 'success');
          }
          setEditSubId(null);
          load();
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al guardar submódulo', 'error');
        } finally {
          setSavingSub(false);
        }
      }
    });
  };

  const filtered = mods.filter(o => {
    const s = search.toLowerCase();
    const estadoStr = o.activo ? 'activo' : 'inactivo';
    return (
      o.nombre?.toLowerCase().includes(s) || 
      estadoStr.includes(s)
    );
  });

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Catálogo de Módulos</h3>
          <p className="text-slate-500 mt-1 italic">Servicios y funcionalidades de la plataforma.</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => navigate('/modulos/nuevo')}><Plus size={16} /></button>
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
        
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size={24} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="th pl-5">Módulo</th>
                  <th className="th text-center">Submódulos</th>
                  <th className="th text-center">Estado</th>
                  <th className="th text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <React.Fragment key={m.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="td pl-5 font-semibold text-slate-900">{m.nombre}</td>
                      <td className="td text-center">
                        {(() => {
                          const c = m.submodulos?.length || 0;
                          return (
                            <div className={`text-sm font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-2 ${c === 0 ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-600'}`}>
                              {c === 0 ? 'Sin submódulos' : `${c} submódulo${c !== 1 ? 's' : ''}`}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="td text-center">
                        <span className={m.activo ? 'badge badge-green' : 'badge badge-red'}>
                          {m.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="td text-center">
                        <div className="flex gap-2 justify-center">
                          <button 
                            className={`p-2 rounded-lg transition-colors ${editId === m.id ? 'bg-violet-100 text-violet-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`} 
                            title="Editar" 
                            onClick={() => editId === m.id ? setEditId(null) : startEdit(m)}
                          >
                            <Pencil size={16} />
                          </button>
                          {m.activo ? (
                            <button 
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors" 
                              title="Desactivar" 
                              onClick={() => { 
                                setConfirmData({
                                  title: 'Desactivar Módulo',
                                  msg: `¿Estás seguro que deseas desactivar el módulo "${m.nombre}" globalmente?`,
                                  type: 'danger',
                                  action: () => toggleStatus(m)
                                }); 
                              }}
                            >
                              <Power size={16} />
                            </button>
                          ) : (
                            <button 
                              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" 
                              title="Activar" 
                              onClick={() => { 
                                setConfirmData({
                                  title: 'Activar Módulo',
                                  msg: `¿Estás seguro que deseas activar el módulo "${m.nombre}" globalmente?`,
                                  action: () => toggleStatus(m)
                                }); 
                              }}
                            >
                              <Power size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {editId === m.id && (
                      <tr>
                        <td colSpan={4} className="bg-slate-50/50 border-b border-slate-100 p-0">
                          <div className="p-5 bg-white border border-slate-200 rounded-xl m-4 shadow-sm">
                            
                            {/* Editar Nombre del Módulo */}
                            <h4 className="font-bold text-slate-900 mb-4 text-sm">Configuración del Módulo</h4>
                            <div className="flex flex-col sm:flex-row items-end gap-3 mb-6 max-w-lg">
                              <div className="w-full">
                                <label className="label text-xs">Nombre *</label>
                                <input className="input" value={editForm.nombre} onChange={e => setEditForm(p => ({ ...p, nombre: formatNombre(e.target.value) }))} maxLength={50} required />
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button type="button" className="btn-secondary text-xs px-4 py-2" onClick={() => setEditId(null)}>Cancelar</button>
                                <button type="button" className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5" disabled={savingEdit} onClick={() => saveEdit(m.id)}>
                                  {savingEdit ? <><Spinner size={14} /> Guardando…</> : 'Guardar'}
                                </button>
                              </div>
                            </div>
                            
                            <hr className="my-6 border-slate-100" />
                            
                            {/* Gestión de Submódulos */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">Submódulos Asociados</h4>
                                <p className="text-xs text-slate-500 mt-0.5 italic">Funcionalidades específicas que componen este módulo.</p>
                              </div>
                              {editSubId !== 'new' && (
                                <button 
                                  className="btn-primary text-xs px-3 py-1.5"
                                  title="Agregar submódulo"
                                  onClick={() => { setEditSubId('new'); setSubForm({ nombre: '', moduloId: m.id }); }}
                                >
                                  <Plus size={14} />
                                </button>
                              )}
                            </div>
                            
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                    <th className="th py-2 px-3">Nombre</th>
                                    <th className="th py-2 px-3 text-center w-24">Estado</th>
                                    <th className="th py-2 px-3 text-center w-28">Acciones</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(m.submodulos || []).map((sub: any) => (
                                    <React.Fragment key={sub.id}>
                                      {editSubId === sub.id ? (
                                        <tr>
                                          <td colSpan={3} className="py-2 px-3 bg-slate-50/80 border-b border-slate-100">
                                            <form onSubmit={(e) => guardarSubmodulo(e, sub.id)} className="flex items-center gap-2">
                                              <input 
                                                className="input text-xs py-1.5 px-2.5 flex-1" 
                                                value={subForm.nombre} 
                                                onChange={e => setSubForm(p => ({ ...p, nombre: formatNombre(e.target.value) }))} 
                                                placeholder="Nombre del submódulo..." 
                                                maxLength={50} 
                                                required 
                                                autoFocus
                                              />
                                              <div className="flex gap-1.5 shrink-0">
                                                <button type="button" className="btn-secondary text-[11px] px-2.5 py-1.5" onClick={() => setEditSubId(null)}>Cancelar</button>
                                                <button type="submit" className="btn-primary text-[11px] px-2.5 py-1.5" disabled={savingSub}>
                                                  {savingSub ? <Spinner size={12} /> : 'Guardar'}
                                                </button>
                                              </div>
                                            </form>
                                          </td>
                                        </tr>
                                      ) : (
                                        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                          <td className="td py-2 px-3 font-medium text-slate-900">{sub.nombre}</td>
                                          <td className="td py-2 px-3 text-center">
                                            <span className={sub.activo ? 'badge badge-green text-[10px] px-1.5 py-0.5' : 'badge badge-red text-[10px] px-1.5 py-0.5'}>
                                              {sub.activo ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                          </td>
                                          <td className="td py-2 px-3 text-center">
                                            <div className="flex gap-1.5 justify-center">
                                              <button 
                                                className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" 
                                                title="Editar" 
                                                onClick={() => { setEditSubId(sub.id); setSubForm({ nombre: sub.nombre, moduloId: m.id }); }}
                                              >
                                                <Pencil size={14} />
                                              </button>
                                              {sub.activo ? (
                                                <button 
                                                  className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors" 
                                                  title="Desactivar submódulo"
                                                  onClick={() => toggleSubStatus(sub)}
                                                ><Power size={14} /></button>
                                              ) : (
                                                <button 
                                                  className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" 
                                                  title="Activar submódulo"
                                                  onClick={() => toggleSubStatus(sub)}
                                                ><Power size={14} /></button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                                  
                                  {editSubId === 'new' && subForm.moduloId === m.id && (
                                    <tr>
                                      <td colSpan={3} className="py-2 px-3 bg-violet-50/50 border-t border-slate-100">
                                        <form onSubmit={(e) => guardarSubmodulo(e, null)} className="flex items-center gap-2">
                                          <input 
                                            className="input text-xs py-1.5 px-2.5 flex-1 border-violet-200 focus:border-violet-500 focus:ring-violet-500" 
                                            value={subForm.nombre} 
                                            onChange={e => setSubForm(p => ({ ...p, nombre: formatNombre(e.target.value) }))} 
                                            placeholder="Nombre del nuevo submódulo..." 
                                            maxLength={50} 
                                            required 
                                            autoFocus
                                          />
                                          <div className="flex gap-1.5 shrink-0">
                                            <button type="button" className="btn-secondary text-[11px] px-2.5 py-1.5" onClick={() => setEditSubId(null)}>Cancelar</button>
                                            <button type="submit" className="btn-primary text-[11px] px-2.5 py-1.5" disabled={savingSub}>
                                              {savingSub ? <Spinner size={12} /> : 'Guardar'}
                                            </button>
                                          </div>
                                        </form>
                                      </td>
                                    </tr>
                                  )}

                                  {!(m.submodulos?.length) && editSubId !== 'new' && (
                                    <tr><td colSpan={3} className="py-6 text-center text-slate-400 text-xs">No se han registrado submódulos para este módulo.</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="td text-center py-16 text-slate-400">
                    <div className="text-3xl mb-2">🧩</div>
                    <p className="font-medium">Sin módulos{search ? ' con ese filtro' : ' en el catálogo'}</p>
                  </td></tr>
                )}
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
