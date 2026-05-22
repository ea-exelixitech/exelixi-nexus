import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui';
import { BADGE, Spinner } from '../components/ui';
import { modulesApi, companiesApi } from '../api';
import { Blocks, Building2, UserPlus, ChevronRight } from 'lucide-react';

const COLORS = [
  { bg: 'bg-sky-50', text: 'text-sky-600', bar: 'bg-sky-500' },
  { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-500' },
  { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500' },
  { bg: 'bg-sky-50', text: 'text-sky-600', bar: 'bg-sky-500' },
  { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500' },
  { bg: 'bg-orange-50', text: 'text-orange-500', bar: 'bg-orange-500' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', bar: 'bg-fuchsia-500' },
  { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-500' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', bar: 'bg-cyan-500' },
  { bg: 'bg-pink-50', text: 'text-pink-600', bar: 'bg-pink-500' },
  { bg: 'bg-yellow-50', text: 'text-yellow-600', bar: 'bg-yellow-500' }
];

export default function Dashboard({ stats, user }: { stats: any; user: any }) {
  const navigate = useNavigate();
  const [modulos, setModulos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      modulesApi.listarTodos().catch(() => ({ data: [] })),
      companiesApi.listar().catch(() => ({ data: [] }))
    ]).then(([resMod, resEmp]) => {
      const modsData = Array.isArray(resMod.data?.data) ? resMod.data.data : Array.isArray(resMod.data) ? resMod.data : [];
      const empData = Array.isArray(resEmp.data?.data) ? resEmp.data.data : Array.isArray(resEmp.data) ? resEmp.data : [];

      // Módulos activos con color aleatorio
      const activos = modsData
        .filter((m: any) => m.activo !== false)
        .map((m: any) => ({
          ...m,
          _color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }));
      setModulos(activos);

      // Empresas ordenadas por ID descendente (las más recientes primero)
      const sortedEmp = [...empData].sort((a, b) => b.id - a.id);
      setEmpresas(sortedEmp);
    }).finally(() => setLoading(false));
  }, []);

  // Calcular adopción de módulos (cuántas empresas usan cada módulo)
  const adoption = modulos.map(m => {
    const usedBy = empresas.filter(e => e.modulos?.some((em: any) => em.moduloId === m.id && em.activo)).length;
    return { ...m, usedBy };
  }).sort((a, b) => b.usedBy - a.usedBy).slice(0, 4);

  return (
    <div className="page-enter">
      {/* Hero / Welcome */}
      <div
        className="rounded-2xl mb-6 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0C133A 0%, #1a2255 60%, #07092a 100%)' }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(237,116,35,0.18) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -left-32 -bottom-32 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(5,198,223,0.10) 0%, transparent 70%)' }}
        />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase mb-3 px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(237,116,35,0.15)',
                color: '#ED7423',
                border: '1px solid rgba(237,116,35,0.3)',
                letterSpacing: '0.12em',
                fontFamily: 'var(--font-display)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full pulse-pumpkin" style={{ background: '#ED7423' }} />
              ADMIN PANEL
            </span>
            <h2
              className="text-2xl sm:text-3xl text-white leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              Hola, <span style={{ color: '#ED7423' }}>{user?.nombre || user?.email?.split('@')[0]}</span>
            </h2>
            <p className="text-white/55 text-sm mt-1.5 max-w-lg">
              Resumen general de la plataforma Exélixi — gestiona empresas, usuarios y módulos desde un solo lugar.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span className="text-[10px] text-white/40 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
              Última sincronización
            </span>
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {new Date().toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <StatCard label="Empresas Registradas" value={stats.empresas} icon="🏢" color="violet" onClick={() => navigate('/empresas')} />
        <StatCard label="Usuarios en Plataforma" value={stats.usuarios} icon="👤" color="blue" onClick={() => navigate('/usuarios')} />
        <StatCard label="Módulos en Catálogo" value={stats.modulos} icon="🧩" color="rose" onClick={() => navigate('/modulos')} />
      </div>

      {/* Acciones Rápidas (Cintillo) */}
      <div className="card p-4 mb-4">
        <p className="text-sm font-bold text-slate-700 mb-4 px-2">Acciones Rápidas</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate('/empresas/nueva')} className="flex-1 py-3 px-4 rounded-xl bg-orange-50 text-orange-600 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold border border-orange-100/50 hover:border-slate-200">
            <Building2 size={18} /> Registrar Empresa
          </button>
          <button onClick={() => navigate('/usuarios/nuevo')} className="flex-1 py-3 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold border border-blue-100/50 hover:border-slate-200">
            <UserPlus size={18} /> Agregar Usuario
          </button>
          <button onClick={() => navigate('/modulos/nuevo')} className="flex-1 py-3 px-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold border border-rose-100/50 hover:border-slate-200">
            <Blocks size={18} /> Configurar Módulo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Columna Izquierda (1/2) */}
        <div className="space-y-5">
          
          {/* Adopción de Módulos */}
          <div className="card p-6">
            <p className="text-sm font-bold text-slate-700 mb-1">Integración de Módulos</p>
            <p className="text-xs text-slate-500 mb-6 italic">Módulos más utilizados por las empresas</p>
            
            {loading ? (
              <div className="flex justify-center py-8"><Spinner size={24} /></div>
            ) : adoption.length > 0 ? (
              <div className="space-y-5">
                {adoption.map(m => {
                  const percentage = empresas.length > 0 ? Math.round((m.usedBy / empresas.length) * 100) : 0;
                  const colorBar = m._color?.bar || 'bg-orange-500';
                  const colorText = m._color?.text || 'text-orange-500';
                  
                  return (
                    <div key={m.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700 flex items-center gap-2">
                          <Blocks size={14} className={colorText} />
                          {m.nombre}
                        </span>
                        <span className="text-slate-500 font-medium text-xs bg-slate-100 px-2 py-0.5 rounded-md">
                          {m.usedBy} emp. ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full ${colorBar} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-medium text-slate-600">No hay datos de integración</p>
              </div>
            )}
          </div>

        </div>

        {/* Columna Derecha (1/2) */}
        <div className="space-y-5">

          {/* Módulos Disponibles */}
          <div className="card p-6">
            <p className="text-sm font-bold text-slate-700 mb-3">Módulos Activos</p>          
            {loading ? (
              <div className="flex justify-center py-8"><Spinner size={24} /></div>
            ) : modulos.length > 0 ? (
              <div className="space-y-3">
                {modulos.slice(0, 4).map((m, i) => {
                  const color = m._color || COLORS[0];
                  const submodulosActivos = Array.isArray(m.submodulos) ? m.submodulos.filter((s: any) => s.activo !== false).length : 0;
                  
                  return (
                    <div key={m.id || i} className={`flex items-center gap-3 p-3 rounded-xl ${color.bg} border border-slate-100`}>
                      <span className={`text-xl w-8 flex justify-center ${color.text}`}>
                        <Blocks size={20} strokeWidth={1.5} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.nombre}</p>
                        <p className="text-xs text-slate-500 truncate italic">
                          {submodulosActivos === 0 
                            ? 'Sin submódulos' 
                            : `${submodulosActivos} submódulo${submodulosActivos !== 1 ? 's' : ''} activo${submodulosActivos !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                <button 
                  onClick={() => navigate('/modulos')}
                  className="w-full py-2 mt-2 text-xs font-semibold italic text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  Ver Catálogo Completo ({stats.modulos})
                </button>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-medium text-slate-600">No hay módulos activos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
