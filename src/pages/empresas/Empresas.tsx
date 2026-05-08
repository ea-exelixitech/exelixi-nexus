import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { companiesApi } from '../../api';
import { Plus, RefreshCw, LayoutDashboard, Power, X } from 'lucide-react';
import { Spinner, Modal, BADGE, ConfirmDialog } from '../../components/ui';

export default function Empresas({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [confirmData, setConfirmData] = useState<{ title?: string; msg: string; type?: 'primary' | 'danger'; action: () => void } | null>(null);

  const load = () => { 
    setLoading(true); 
    companiesApi.listar()
      .then((r) => {
        const data = r.data.data || r.data || [];
        setCompanies(data.sort((a: any, b: any) => {
          if (a.activo !== b.activo) return (b.activo === true ? 1 : 0) - (a.activo === true ? 1 : 0);
          return (a.nombre || '').localeCompare(b.nombre || '');
        }));
      })
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false)); 
  };
  
  useEffect(load, []);


  const filtered = companies.filter(o => {
    const s = search.toLowerCase();
    const estadoStr = o.activo ? 'activo' : 'inactivo';
    return (
      o.nombre?.toLowerCase().includes(s) || 
      o.rif?.toLowerCase().includes(s) ||
      o.tipo?.toLowerCase().includes(s) ||
      estadoStr.includes(s)
    );
  });

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Empresas Clientes</h3>
          <p className="text-slate-500 italic mt-1">Directorio de empresas clientes registrados en la plataforma.</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => navigate('/empresas/nueva')}><Plus size={16} /></button>
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
                <X size={16} />
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
                  <th className="th pl-5">Nombre / Razón Social</th>
                  <th className="th text-center">Tipo</th>
                  <th className="th text-center">Módulos</th>
                  <th className="th text-center">Estado</th>
                  <th className="th text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="td pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 shrink-0">
                          {o.nombre?.charAt(0).toUpperCase() || '—'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{o.nombre}</p>
                          {o.rif && <p className="text-xs text-slate-400">RIF: {o.rif}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="td text-center">
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">{o.tipo || 'Sin tipo'}</span>
                    </td>
                    <td className="td text-center">
                      {(() => {
                        // Un módulo cuenta como activo para la empresa si la relación está activa (m.activo)
                        // y el módulo en sí está activo globalmente (m.modulo.activo !== false)
                        const c = o.modulos?.filter((m: any) => m.activo && m.modulo?.activo !== false).length || 0;
                        return (
                          <div className={`text-sm font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-2 ${c === 0 ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-600'}`}>
                            {c === 0 ? 'Sin módulos' : `${c} módulo${c !== 1 ? 's' : ''}`}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="td text-center"><span className={o.activo ? BADGE['ACTIVE'] : BADGE['INACTIVE']}>{o.activo ? 'ACTIVO' : 'INACTIVO'}</span></td>
                    <td className="td text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" title="Ver Dashboard" onClick={() => navigate('/empresas/' + o.id)}><LayoutDashboard size={16} /></button>
                        {o.activo ? (
                          <button className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors" title="Desactivar" onClick={() => { 
                            setConfirmData({
                              title: 'Desactivar empresa',
                              msg: `¿Estás seguro que deseas desactivar la empresa "${o.nombre}"?`,
                              type: 'danger',
                              action: () => companiesApi.actualizar(o.id.toString(), { activo: false }).then(() => { load(); toast('Empresa desactivada', 'success'); }).catch((err: any) => toast(err.response?.data?.message || err.message || 'Error al desactivar', 'error'))
                            }); 
                          }}><Power size={16} /></button>
                        ) : (
                          <button className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Activar" onClick={() => { 
                            setConfirmData({
                              title: 'Activar empresa',
                              msg: `¿Estás seguro que deseas activar la empresa "${o.nombre}" nuevamente?`,
                              action: () => companiesApi.actualizar(o.id.toString(), { activo: true }).then(() => { load(); toast('Empresa activada', 'success'); }).catch((err: any) => toast(err.response?.data?.message || err.message || 'Error al activar', 'error'))
                            }); 
                          }}><Power size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="td text-center py-16 text-slate-400">
                    <div className="text-3xl mb-2">🏢</div>
                    <p className="font-medium">Sin empresas{search ? ' con ese filtro' : ' registradas'}</p>
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