import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { modulesApi } from '../../api';
import { X, Plus, Trash2, Plug } from 'lucide-react';
import { Spinner, ConfirmDialog, Modal } from '../../components/ui';
import ModuloIntegracionPanel from '../../components/ModuloIntegracionPanel';
import { PASOS_RAPIDOS, type SubmoduloIntegracion } from '../../lib/moduloIntegracion';

const formatNombre = (value: string) => {
  return value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]/g, '').substring(0, 50);
};

export default function ModuloCrear({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '' });
  const [submodulos, setSubmodulos] = useState<{ id: string, nombre: string, url: string }[]>([]);
  const [confirmData, setConfirmData] = useState<{ title?: string; msg: string; type?: 'primary' | 'danger'; action: () => void } | null>(null);
  const [handoff, setHandoff] = useState<{ moduloNombre: string; subs: SubmoduloIntegracion[] } | null>(null);

  const addSubmodulo = () => {
    setSubmodulos([...submodulos, { id: Date.now().toString(), nombre: '', url: '' }]);
  };

  const updateSubmodulo = (id: string, field: 'nombre' | 'url', val: string) => {
    setSubmodulos(submodulos.map(s =>
      s.id === id ? { ...s, [field]: field === 'nombre' ? formatNombre(val) : val.trim() } : s
    ));
  };

  const removeSubmodulo = (id: string) => {
    setSubmodulos(submodulos.filter(s => s.id !== id));
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();

    setConfirmData({
      title: 'Crear Módulo',
      msg: '¿Estás seguro que deseas registrar este nuevo módulo global' + (submodulos.length > 0 ? ` y sus ${submodulos.length} submódulos` : '') + '?',
      action: async () => {
        setSaving(true);
        try {
          const r = await modulesApi.crear(form);
          const newModule = r.data?.data || r.data;
          
          if (!newModule || !newModule.id) {
             throw new Error('No se recibió el ID del módulo creado.');
          }

          if (submodulos.length > 0) {
            const results = await Promise.all(
              submodulos.map((sub) =>
                modulesApi.crearSubmodulo({
                  nombre: sub.nombre.trim(),
                  url: sub.url || null,
                  moduloId: Number(newModule.id),
                }),
              ),
            );
            const createdSubs: SubmoduloIntegracion[] = results.map((r, i) => {
              const row = r.data?.data ?? r.data;
              return {
                id: Number(row.id),
                nombre: row.nombre ?? submodulos[i].nombre,
                url: row.url ?? (submodulos[i].url || null),
              };
            });
            setHandoff({ moduloNombre: form.nombre.trim(), subs: createdSubs });
          } else {
            toast('Módulo creado con éxito', 'success');
            navigate('/modulos');
          }
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al crear módulo', 'error');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/modulos')} className="btn-ghost btn-icon text-slate-500 hover:text-slate-900"><X size={20} /></button>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Nuevo Módulo</h3>
          <p className="text-slate-500 mt-1 italic">Ingrese el nombre del nuevo módulo global y sus submódulos.</p>
          <ul className="mt-2 text-xs text-sky-800 list-disc list-inside space-y-0.5">
            {PASOS_RAPIDOS.slice(0, 3).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <form id="create-module-form" onSubmit={guardar}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Detalles del Módulo */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-5">
              <h2 className="font-bold text-slate-900 mb-4">Detalles</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input 
                    className="input w-full" 
                    value={form.nombre} 
                    onChange={e => setForm(p => ({ ...p, nombre: formatNombre(e.target.value) }))} 
                    placeholder="Ej. Facturación" 
                    maxLength={50} 
                    required 
                  />
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                <button type="button" className="btn-secondary flex-1" onClick={() => navigate('/modulos')}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? <><Spinner /> Guardando…</> : 'Guardar'}</button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Submódulos */}
          <div className="lg:col-span-2">
            <div className="card p-0">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Submódulos Asociados</h2>
                  <p className="text-sm text-slate-400 mt-1 italic">Añada las funcionalidades específicas que compondrán este módulo.</p>
                </div>
                <button type="button" onClick={addSubmodulo} className="btn-primary text-sm px-4 py-2 flex items-center gap-2" title="Añadir">
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="p-5 bg-slate-50/50">
                <div className="space-y-3">
                  {submodulos.map((sub, index) => (
                    <div key={sub.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-colors focus-within:border-orange-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">
                          {index + 1}
                        </div>
                        <input
                          className="input flex-1 border-transparent hover:border-slate-200 focus:border-orange-300 focus:ring-0 shadow-none bg-transparent"
                          value={sub.nombre}
                          onChange={e => updateSubmodulo(sub.id, 'nombre', e.target.value)}
                          placeholder="Nombre del submódulo..."
                          maxLength={50}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeSubmodulo(sub.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <input
                        className="input w-full text-xs font-mono border-slate-200 focus:border-orange-300 focus:ring-0"
                        value={sub.url}
                        onChange={e => updateSubmodulo(sub.id, 'url', e.target.value)}
                        placeholder="URL del servicio (ej: http://192.168.10.215:5173)"
                        type="url"
                      />
                    </div>
                  ))}
                  
                  {submodulos.length === 0 && (
                    <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Plus size={20} />
                      </div>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        Haga clic en el botón <span className="font-bold">Añadir</span> de la esquina superior derecha para registrar submódulos.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {confirmData && (
        <ConfirmDialog
          title={confirmData.title}
          msg={confirmData.msg}
          type={confirmData.type}
          onConfirm={confirmData.action}
          onCancel={() => setConfirmData(null)}
        />
      )}

      {handoff && handoff.subs[0] && (
        <Modal
          title="Módulo creado — datos de integración"
          onClose={() => {
            setHandoff(null);
            toast('Módulo creado con éxito', 'success');
            navigate('/modulos');
          }}
          size="lg"
        >
          <p className="text-sm text-slate-600 mb-4">
            Copie la configuración al equipo del microfrontend. Luego active el módulo por empresa en{' '}
            <strong>Empresas</strong>.
          </p>
          <ModuloIntegracionPanel moduloNombre={handoff.moduloNombre} submodulo={handoff.subs[0]} />
          {handoff.subs.length > 1 && (
            <p className="text-xs text-slate-500 mt-4">
              Hay {handoff.subs.length} submódulos: use el botón <Plug size={12} className="inline" /> Integración en
              Módulos para los demás ids.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
