import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companiesApi, modulesApi } from '../../api';
import { X, Pencil, Check } from 'lucide-react';
import { Spinner, BADGE, ConfirmDialog } from '../../components/ui';

const formatRif = (value: string) => {
  let val = value.toUpperCase().replace(/[^VEJG0-9]/g, '');
  if (val.length === 0) return '';
  if (!/^[VEJG]/.test(val)) {
    val = val.replace(/^[^VEJG]+/, '');
    if (val.length === 0) return '';
  }
  let formatted = val.charAt(0);
  if (val.length > 1) formatted += '-' + val.substring(1, 9);
  if (val.length > 9) formatted += '-' + val.substring(9, 10);
  return formatted;
};

const formatNombre = (value: string) => {
  return value.replace(/[^a-zA-Z0-9\s\-\.,'&()áéíóúÁÉÍÓÚñÑüÜ]/g, '').substring(0, 50);
};

export default function EmpresaDashboard({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nombre: '', rif: '', tipo: '' });
  const [confirmData, setConfirmData] = useState<{ title?: string; msg: string; type?: 'primary' | 'danger'; action: () => void } | null>(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      companiesApi.detalle(id).catch(() => null),
      modulesApi.listarTodos().catch(() => ({ data: [] }))
    ]).then(([c, m]) => {
      if (c && (c.data?.data || c.data)) {
        const comp = c.data?.data || c.data;
        setCompany(comp);
        setForm({ nombre: comp.nombre, rif: comp.rif || '', tipo: comp.tipo || '' });
      } else {
        toast('Empresa no encontrada', 'error');
        navigate('/empresas');
      }

      const mods = m.data?.data || m.data || [];
      // Mostrar solo módulos activos globalmente
      setAllModules(mods.filter((x: any) => x.activo));
    }).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const guardarDetalles = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setConfirmData({
      title: 'Guardar cambios',
      msg: '¿Estás seguro que deseas actualizar los datos de esta empresa?',
      action: async () => {
        setSaving(true);
        try {
          await companiesApi.actualizar(id, form);
          toast('Empresa actualizada exitosamente', 'success');
          setEditMode(false);
          load();
        } catch (err: any) {
          toast(err.response?.data?.message || 'Error al guardar empresa', 'error');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const toggleModule = async (moduleId: string | number, isActive: boolean, moduleObj: any) => {
    if (!company) return;

    // Validación: no se puede activar un módulo si no tiene submódulos (globalmente activos)
    const submodulosActivos = (moduleObj.submodulos || []).filter((s: any) => s.activo);
    if (!isActive && submodulosActivos.length === 0) {
        toast(`El módulo "${moduleObj.nombre}" no tiene submódulos disponibles y no puede activarse.`, 'error');
        return;
    }

    setConfirmData({
      title: isActive ? 'Desactivar módulo' : 'Activar módulo',
      msg: `¿Estás seguro que deseas ${isActive ? 'desactivar' : 'activar'} el módulo "${moduleObj.nombre}" para esta empresa?`,
      type: isActive ? 'danger' : 'primary',
      action: async () => {
        try {
          await companiesApi.toggleModule({
            empresaId: Number(company.id),
            moduloId: Number(moduleId),
            active: !isActive
          });
          load(); // Recarga los detalles para ver el nuevo estatus
          toast(isActive ? 'Módulo desactivado' : 'Módulo activado', 'success');
        } catch (err: any) {
          toast(err.response?.data?.message || 'Error al cambiar módulo', 'error');
        }
      }
    });
  };

  const toggleSubmodule = async (submoduleId: string | number, isActive: boolean, submoduleName: string, moduleId: number) => {
    if (!company) return;

    // Validar que el módulo principal siga teniendo submódulos globalmente activos si vamos a desactivar este
    if (isActive) {
        // Obtenemos los submódulos de la empresa para este módulo
        const empresaMod = company.modulos.find((m: any) => m.moduloId === moduleId);
        // Contamos cuántos de esos submódulos están activos actualmente en la empresa y además están globalmente activos
        const activeSubsCount = empresaMod?.modulo?.submodulos?.filter((s: any) => 
            s.activoEmpresa && s.activo !== false
        ).length || 0;

        if (activeSubsCount <= 1) {
            toast(`El módulo debe tener al menos un submódulo activo. Si desea desactivarlo por completo, desactive el módulo principal.`, 'error');
            return;
        }
    }

    setConfirmData({
      title: isActive ? 'Desactivar submódulo' : 'Activar submódulo',
      msg: `¿Estás seguro que deseas ${isActive ? 'desactivar' : 'activar'} el submódulo "${submoduleName}" para esta empresa?`,
      type: isActive ? 'danger' : 'primary',
      action: async () => {
        try {
          await companiesApi.toggleSubmodule({
            empresaId: Number(company.id),
            submoduloId: Number(submoduleId),
            active: !isActive
          });
          load(); // Recarga los detalles
          toast(isActive ? 'Submódulo desactivado' : 'Submódulo activado', 'success');
        } catch (err: any) {
          toast(err.response?.data?.message || 'Error al cambiar submódulo', 'error');
        }
      }
    });
  };


  const toggleStatus = () => {
    if (!company) return;
    setConfirmData({
      title: company.activo ? 'Desactivar empresa' : 'Activar empresa',
      msg: `¿Estás seguro que deseas ${company.activo ? 'desactivar' : 'activar'} la empresa "${company.nombre}"?`,
      type: company.activo ? 'danger' : 'primary',
      action: async () => {
        try {
          if (company.activo) {
            await companiesApi.actualizar(company.id.toString(), { activo: false });
            toast('Empresa desactivada', 'success');
          } else {
            await companiesApi.actualizar(company.id.toString(), { activo: true });
            toast('Empresa activada', 'success');
          }
          load();
        } catch (err: any) {
          toast(err.response?.data?.message || 'Error al cambiar estado', 'error');
        }
      }
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size={32} /></div>;
  }

  if (!company) return null;

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/empresas')} className="btn-ghost btn-icon text-slate-500 hover:text-slate-900"><X size={20} /></button>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">{company.nombre}</h3>
          <span className={company.activo ? BADGE['ACTIVE'] : BADGE['INACTIVE']}>{company.activo ? 'ACTIVO' : 'INACTIVO'}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button 
            className={`btn-secondary text-sm ${company.activo ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
            onClick={toggleStatus}
          >
            {company.activo ? 'DESACTIVAR EMPRESA' : 'ACTIVAR EMPRESA'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Detalles */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">{!editMode ? 'Detalles' : 'Editar'}</h2>
              {!editMode && <button onClick={() => setEditMode(true)} className="btn-ghost btn-icon text-slate-400 hover:text-orange-500" title="Editar"><Pencil size={16} /></button>}
            </div>
            
            {editMode ? (
              <form onSubmit={guardarDetalles} className="space-y-3">
                <div><label className="label">Nombre *</label><input className="input w-full" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: formatNombre(e.target.value) }))} maxLength={50} required /></div>
                <div><label className="label">RIF *</label><input className="input w-full" value={form.rif} onChange={e => setForm(p => ({ ...p, rif: formatRif(e.target.value) }))} placeholder="J-12345678-9" required /></div>
                <div><label className="label">Tipo *</label>
                  <select className="input w-full" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} required>
                    <option value="SaaS Provider">SaaS Provider</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2 mt-4 border-t border-slate-100">
                  <button type="button" className="btn-secondary flex-1 text-xs mt-3" onClick={() => { setEditMode(false); setForm({ nombre: company.nombre, rif: company.rif || '', tipo: company.tipo || '' }); }}>Cancelar</button>
                  <button type="submit" className="btn-primary flex-1 text-xs mt-3" disabled={saving}>{saving ? <><Spinner /> Guardando…</> : 'Guardar'}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nombre</p>
                  <p className="font-medium text-slate-900">{company.nombre}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">RIF</p>
                  <p className="font-medium text-slate-900">{company.rif || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tipo</p>
                  <p className="font-medium text-slate-900">{company.tipo || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Módulos */}
        <div className="lg:col-span-2">
          <div className="card p-0">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">Módulos asociados</h2>
              <p className="text-sm text-slate-400 mt-1 italic">Active o desactive los módulos y submódulos para esta empresa.</p>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
              {allModules.map(mod => {
                // Verificar si la empresa tiene activo este módulo
                const rel = (company.modulos || []).find((m: any) => m.moduloId === mod.id);
                const isActive = rel?.activo || false;
                
                // Mostrar también sus submódulos (incluyendo inactivos globalmente con coletilla)
                // Mezclamos los del catálogo con los que ya pueda tener la empresa
                const mapSubs = new Map();
                (mod.submodulos || []).forEach((s: any) => mapSubs.set(s.id, s));
                (rel?.modulo?.submodulos || []).forEach((s: any) => {
                    if (!mapSubs.has(s.id)) mapSubs.set(s.id, s);
                });
                const submodulosTotales = Array.from(mapSubs.values());
                const submodulosActivosGlobalmente = submodulosTotales.filter((s: any) => s.activo !== false);
                const hasSubmodulos = submodulosActivosGlobalmente.length > 0;
                
                return (
                  <div key={mod.id} className={`flex flex-col p-4 rounded-xl border transition-colors ${isActive ? 'border-orange-200 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${isActive ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-400 grayscale'}`}>{mod.icon || '🧩'}</div>
                        <div className="min-w-0">
                          <p className={`font-bold truncate transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{mod.nombre}</p>
                          <p className={`text-[11px] mt-0.5 truncate ${!hasSubmodulos ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
                            {!hasSubmodulos ? 'No hay submódulos disponibles' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        disabled={!hasSubmodulos}
                        onClick={() => hasSubmodulos && toggleModule(mod.id, isActive, mod)}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!hasSubmodulos ? 'bg-slate-200 cursor-not-allowed' : isActive ? 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer' : 'bg-slate-300 hover:bg-slate-400 cursor-pointer'}`}
                        title={!hasSubmodulos ? 'Módulo sin submódulos' : isActive ? 'Desactivar módulo' : 'Activar módulo'}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>

                    {/* Submódulos */}
                    {submodulosTotales.length > 0 && (
                      <div className={`pt-3 mt-1 border-t transition-opacity duration-200 ${isActive ? 'border-slate-100 opacity-100' : 'border-slate-100 opacity-50'}`}>
                        <p className="text-xs font-semibold text-slate-500 mb-2">Submódulos:</p>
                        <div className="space-y-2">
                          {submodulosTotales.map((sub: any) => {
                            // Buscar el estado del submódulo en la empresa
                            const compSub = rel?.modulo?.submodulos?.find((s: any) => s.id === sub.id);
                            // Un submódulo se considera activo si el módulo padre está activo Y la bandera activoEmpresa es true
                            const isSubActive = isActive && (compSub?.activoEmpresa || false);
                            const isSubGlobalActive = sub.activo !== false;

                            return (
                              <div key={sub.id} className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${isSubActive ? 'border-orange-200 bg-orange-50/50' : 'border-slate-100 bg-white'} ${!isSubGlobalActive ? 'opacity-60' : ''}`}>
                                <span className={`text-sm font-medium ${isSubActive ? 'text-orange-600' : 'text-slate-500'}`}>
                                  {sub.nombre}
                                  {!isSubGlobalActive && <span className="text-[10px] text-red-500 ml-2">(Inactivo globalmente)</span>}
                                </span>
                                <button 
                                  type="button"
                                  disabled={!isActive || !isSubGlobalActive}
                                  onClick={() => isActive && isSubGlobalActive && toggleSubmodule(sub.id, isSubActive, sub.nombre, mod.id)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!isActive || !isSubGlobalActive ? 'bg-slate-200 cursor-not-allowed' : isSubActive ? 'bg-orange-500 hover:bg-orange-500' : 'bg-slate-300 hover:bg-slate-400'}`}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSubActive ? 'translate-x-4' : 'translate-x-0'}`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {allModules.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-400">
                  <p className="font-medium">No hay módulos globales activos en el catálogo.</p>
                </div>
              )}
            </div>
          </div>
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
