import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { companiesApi, modulesApi } from '../../api';
import { X, Check } from 'lucide-react';
import { Spinner, ConfirmDialog } from '../../components/ui';

const formatRif = (value: string) => {
  let val = value.toUpperCase().replace(/[^VEJG0-9]/g, '');
  if (val.length === 0) return '';
  if (!/^[VEJG]/.test(val)) {
    val = val.replace(/^[^VEJG]+/, '');
    if (val.length === 0) return '';
  }
  
  const firstChar = val.charAt(0);
  const rest = val.substring(1).replace(/[^0-9]/g, '');
  
  let formatted = firstChar;
  if (rest.length > 0) formatted += '-' + rest.substring(0, 8);
  if (rest.length > 8) formatted += '-' + rest.substring(8, 9);
  
  return formatted;
};

const formatNombre = (value: string) => {
  return value.replace(/[^a-zA-Z0-9\s\-\.,'&()áéíóúÁÉÍÓÚñÑüÜ]/g, '').substring(0, 50);
};

export default function EmpresaCrear({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const navigate = useNavigate();
  const [allModules, setAllModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', rif: '', tipo: '' });
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [selectedSubmodules, setSelectedSubmodules] = useState<number[]>([]);
  const [confirmData, setConfirmData] = useState<{ title?: string; msg: string; type?: 'primary' | 'danger'; action: () => void } | null>(null);

  const load = () => {
    setLoading(true);
    modulesApi.listarTodos()
      .then(m => {
        const mods = m.data?.data || m.data || [];
        // Mostrar solo módulos activos globalmente
        setAllModules(mods.filter((x: any) => x.activo));
      })
      .catch(() => setAllModules([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleModuleSelection = (moduleId: number) => {
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(id => id !== moduleId));
      // Deseleccionar también sus submódulos
      const moduleObj = allModules.find(m => m.id === moduleId);
      if (moduleObj && moduleObj.submodulos) {
        const subIds = moduleObj.submodulos.map((s: any) => s.id);
        setSelectedSubmodules(selectedSubmodules.filter(id => !subIds.includes(id)));
      }
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
  };

  const toggleSubmoduleSelection = (submoduleId: number, moduleId: number) => {
    // Si se selecciona un submódulo, asegurar que su módulo padre también esté seleccionado
    if (!selectedSubmodules.includes(submoduleId)) {
      setSelectedSubmodules([...selectedSubmodules, submoduleId]);
      if (!selectedModules.includes(moduleId)) {
        setSelectedModules([...selectedModules, moduleId]);
      }
    } else {
      setSelectedSubmodules(selectedSubmodules.filter(id => id !== submoduleId));
    }
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validar que cada módulo seleccionado tenga al menos un submódulo seleccionado
    for (const moduleId of selectedModules) {
      const moduleObj = allModules.find(m => m.id === moduleId);
      if (moduleObj) {
        const subIds = (moduleObj.submodulos || []).filter((s: any) => s.activo).map((s: any) => s.id);
        if (subIds.length > 0) {
          const hasSelectedSub = selectedSubmodules.some(id => subIds.includes(id));
          if (!hasSelectedSub) {
            toast(`El módulo "${moduleObj.nombre}" debe tener al menos un submódulo seleccionado.`, 'error');
            return;
          }
        }
      }
    }

    setConfirmData({
      title: 'Crear empresa',
      msg: '¿Estás seguro que deseas registrar esta nueva empresa y asignarle los módulos/submódulos seleccionados?',
      action: async () => {
        setSaving(true);
        try {
          // 1. Create the company
          const r = await companiesApi.crear(form);
          const newCompany = r.data?.data || r.data;
          
          if (!newCompany || !newCompany.id) {
             throw new Error('No se recibió el ID de la empresa creada.');
          }

          // 2. Assign the selected modules
          if (selectedModules.length > 0) {
            const togglePromises = selectedModules.map(moduleId => 
              companiesApi.toggleModule({
                empresaId: Number(newCompany.id),
                moduloId: moduleId,
                active: true
              })
            );
            await Promise.all(togglePromises);
          }

          // 3. Assign the selected submodules
          if (selectedSubmodules.length > 0) {
            const toggleSubPromises = selectedSubmodules.map(subId => 
              companiesApi.toggleSubmodule({
                empresaId: Number(newCompany.id),
                submoduloId: subId,
                active: true
              })
            );
            await Promise.all(toggleSubPromises);
          }

          toast('Empresa creada y configurada exitosamente', 'success');
          // Navegar al detalle para ver las URLs de acceso generadas
          navigate(`/empresas/${newCompany.id}`);
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al guardar empresa', 'error');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size={32} /></div>;
  }

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/empresas')} className="btn-ghost btn-icon text-slate-500 hover:text-slate-900"><X size={20} /></button>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Nueva Empresa</h3>
          <p className="text-slate-500 mt-1 italic">Registro y configuración inicial de la empresa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Detalles */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <h2 className="font-bold text-slate-900 mb-4">Detalles</h2>
            <form id="create-company-form" onSubmit={guardar} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input className="input w-full" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: formatNombre(e.target.value) }))} maxLength={50} required />
              </div>
              <div>
                <label className="label">RIF *</label>
                <input className="input w-full" value={form.rif} onChange={e => setForm(p => ({ ...p, rif: formatRif(e.target.value) }))} placeholder="J-12345678-9" required />
              </div>
              <div>
                <label className="label">Tipo *</label>
                <select className="input w-full" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} required>
                  <option value="" disabled>Seleccione...</option>
                  <option value="SaaS Provider">SaaS Provider</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                <button type="button" className="btn-secondary flex-1" onClick={() => navigate('/empresas')}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? <><Spinner /> Guardando…</> : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Módulos */}
        <div className="lg:col-span-2">
          <div className="card p-0">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">Módulos asociados</h2>
              <p className="text-sm text-slate-400 mt-1 italic">Seleccione los módulos y submódulos que estarán activos inicialmente para esta empresa.</p>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
              {allModules.map(mod => {
                const isActive = selectedModules.includes(mod.id);
                // Mostrar también sus submódulos (incluyendo inactivos globalmente con coletilla)
                const submodulosTotales = mod.submodulos || [];
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
                            {!hasSubmodulos ? 'Sin submódulos disponibles' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        disabled={!hasSubmodulos}
                        onClick={() => hasSubmodulos && toggleModuleSelection(mod.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!hasSubmodulos ? 'bg-slate-200 cursor-not-allowed' : isActive ? 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer' : 'bg-slate-300 hover:bg-slate-400 cursor-pointer'}`}
                        title={!hasSubmodulos ? 'Módulo sin submódulos' : isActive ? 'Quitar módulo' : 'Añadir módulo'}
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
                            const isSubActive = selectedSubmodules.includes(sub.id);
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
                                  onClick={() => isActive && isSubGlobalActive && toggleSubmoduleSelection(sub.id, mod.id)}
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
                <div className="p-8 text-center text-slate-400 col-span-full">
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
