import React, { useState, useEffect, useCallback, useRef } from 'react';
import { companiesApi } from '../../api';
import { RefreshCw, ChevronDown, ChevronUp, Layers, AlertCircle, ExternalLink, Play, Wifi, WifiOff, Activity, SlidersHorizontal } from 'lucide-react';
import { Spinner, ConfirmDialog } from '../../components/ui';
import api from '../../api';

// ── Hook: verifica si una URL está respondiendo ───────────────────────────
function useModuleHealth(url: string | undefined, enabled: boolean) {
  const [online, setOnline] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = useCallback(async () => {
    if (!url) return;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3000);
      const r = await fetch(url, { method: 'GET', signal: ctrl.signal, mode: 'no-cors' });
      clearTimeout(t);
      // no-cors → opaque, pero si no lanza excepción, el servidor responde
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [url]);

  useEffect(() => {
    if (!enabled || !url) return;
    check();
    timerRef.current = setInterval(check, 15000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [url, enabled, check]);

  return { online, recheck: check };
}

// ── Iconos por nombre de módulo ───────────────────────────────────────────────
const MODULE_ICONS: Record<string, string> = {
  ocr: '🔍',
  formulario: '📋',
  form: '📋',
  emision: '📄',
  emisión: '📄',
  pagos: '💳',
  pago: '💳',
  rcv: '🛡️',
  suscripcion: '🛡️',
  suscripción: '🛡️',
};

function getModuleIcon(nombre: string): string {
  const key = nombre.toLowerCase();
  for (const [k, icon] of Object.entries(MODULE_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return '🧩';
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Submodulo {
  id: number;
  nombre: string;
  activo: boolean;
  activoEmpresa: boolean;
}

interface ModuloEmpresa {
  id: number | null;
  empresaId: number;
  moduloId: number;
  activo: boolean;
  modulo: {
    id: number;
    nombre: string;
    activo: boolean;
    url?: string;
    orden?: number;
    submodulos: Submodulo[];
  };
}

interface Empresa {
  id: number;
  nombre: string;
  rif: string;
  activo: boolean;
  modulos: ModuloEmpresa[];
}

interface FlowStatus {
  allModulesActive: boolean;
  fullFlowUrl: string;
  modules: { id: number; nombre: string; orden: number; url: string; activo: boolean }[];
}

// ── Componente Toggle Switch ──────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled,
  size = 'md',
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const thumb = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={[
        'relative inline-flex shrink-0 rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
        track,
        disabled
          ? 'cursor-not-allowed bg-slate-200 opacity-60'
          : checked
          ? 'cursor-pointer bg-emerald-500 hover:bg-emerald-600'
          : 'cursor-pointer bg-slate-300 hover:bg-slate-400',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0',
          'transition duration-200 ease-in-out',
          thumb,
          checked ? translate : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

// ── Tarjeta de módulo ─────────────────────────────────────────────────────────
function ModuloCard({
  moduloEmpresa,
  networkIp,
  onToggleModule,
  onToggleSubmodulo,
}: {
  moduloEmpresa: ModuloEmpresa;
  networkIp: string;
  onToggleModule: (moduloId: number, active: boolean) => void;
  onToggleSubmodulo: (submoduloId: number, active: boolean, nombre: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const mod = moduloEmpresa.modulo;
  const isModActive = moduloEmpresa.activo;
  const icon = getModuleIcon(mod.nombre);
  const submodulosGlobales = (mod.submodulos || []).filter((s) => s.activo !== false);
  const submodulosActivos = submodulosGlobales.filter((s) => s.activoEmpresa);
  const hasSubmodulos = submodulosGlobales.length > 0;
  const { online, recheck } = useModuleHealth(mod.url, isModActive);
  const networkUrl = mod.url?.replace('localhost', networkIp || 'localhost');

  return (
    <div
      className="rounded-2xl border bg-white transition-all duration-200 overflow-hidden"
      style={isModActive
        ? { borderColor: 'rgba(237,116,35,0.25)', boxShadow: '0 4px 20px rgba(237,116,35,0.08)' }
        : { borderColor: '#e2e8f0' }
      }
    >
      {/* Franja de color superior */}
      <div
        className="h-1 w-full transition-all"
        style={{ background: isModActive ? 'linear-gradient(90deg, #ED7423, #0C133A)' : '#e2e8f0' }}
      />

      {/* Header del módulo */}
      <div className="flex items-center gap-4 px-5 pt-4 pb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all"
          style={isModActive
            ? { background: 'rgba(237,116,35,0.10)' }
            : { background: '#f1f5f9', filter: 'grayscale(1)', opacity: 0.6 }
          }
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className={['font-bold text-base leading-tight', isModActive ? 'text-slate-900' : 'text-slate-400'].join(' ')}>
            {mod.nombre}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {isModActive ? (
              <span className="text-xs font-semibold text-emerald-600">
                {submodulosActivos.length}/{submodulosGlobales.length} submódulos activos
              </span>
            ) : (
              <span className="text-xs text-slate-400">Módulo desactivado</span>
            )}
            {/* Indicador live */}
            {mod.url && isModActive && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full cursor-pointer"
                style={online === true
                  ? { background: 'rgba(16,185,129,0.12)', color: '#059669' }
                  : online === false
                  ? { background: 'rgba(239,68,68,0.12)', color: '#dc2626' }
                  : { background: '#f1f5f9', color: '#94a3b8' }
                }
                onClick={recheck}
                title="Clic para verificar"
              >
                {online === true ? <Wifi size={10}/> : online === false ? <WifiOff size={10}/> : <Activity size={10}/>}
                {online === true ? 'EN LÍNEA' : online === false ? 'SIN CONEXIÓN' : 'VERIFICANDO…'}
              </span>
            )}
          </div>
        </div>

        {/* Toggle principal */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={isModActive
              ? { background: 'rgba(237,116,35,0.10)', color: '#ED7423' }
              : { background: '#f1f5f9', color: '#94a3b8' }
            }
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isModActive ? '#ED7423' : '#cbd5e1' }} />
            {isModActive ? 'ACTIVO' : 'INACTIVO'}
          </span>
          <Toggle
            checked={isModActive}
            onChange={() => onToggleModule(mod.id, isModActive)}
            disabled={!hasSubmodulos}
          />
        </div>
      </div>

      {/* Botones Ver en vivo */}
      {mod.url && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {/* Local */}
          <a
            href={online === false ? undefined : mod.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => (!isModActive || online === false) && e.preventDefault()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
            style={isModActive && online !== false
              ? { borderColor: 'rgba(237,116,35,0.3)', background: 'rgba(237,116,35,0.06)', color: '#ED7423' }
              : { borderColor: '#e2e8f0', background: '#f8fafc', color: '#94a3b8', pointerEvents: 'none', opacity: 0.6 }
            }
            title={online === false ? 'Módulo no disponible — inicia el servidor primero' : 'Abrir en este equipo'}
          >
            <ExternalLink size={11} />
            Local — {mod.url}
            {online === false && <AlertCircle size={10} className="text-red-400" />}
          </a>

          {/* Red */}
          {networkIp && networkUrl !== mod.url && (
            <a
              href={online === false ? undefined : networkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => (!isModActive || online === false) && e.preventDefault()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
              style={isModActive && online !== false
                ? { borderColor: 'rgba(12,19,58,0.25)', background: 'rgba(12,19,58,0.05)', color: '#0C133A' }
                : { borderColor: '#e2e8f0', background: '#f8fafc', color: '#94a3b8', pointerEvents: 'none', opacity: 0.6 }
              }
              title="Abrir desde otro dispositivo en la red"
            >
              <Wifi size={11} />
              Red — {networkUrl}
            </a>
          )}
        </div>
      )}

      {/* Submódulos */}
      {submodulosGlobales.length > 0 && (
        <div className="border-t px-5 pb-4 pt-3 space-y-2" style={{ borderColor: isModActive ? 'rgba(237,116,35,0.12)' : '#f1f5f9' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Layers size={11} />
              Submódulos ({submodulosGlobales.length})
            </p>
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              {expanded ? <><ChevronUp size={12}/> ocultar</> : <><ChevronDown size={12}/> ver</>}
            </button>
          </div>

          {expanded && submodulosGlobales.map(sub => {
            const isSubActive = isModActive && sub.activoEmpresa;
            return (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 rounded-xl border transition-all"
                style={isSubActive
                  ? { borderColor: 'rgba(237,116,35,0.2)', background: 'rgba(237,116,35,0.04)' }
                  : { borderColor: '#f1f5f9', background: '#f8fafc' }
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: isSubActive ? '#ED7423' : '#cbd5e1' }}
                  />
                  <span className={['text-sm font-medium truncate', isSubActive ? 'text-slate-900' : 'text-slate-400'].join(' ')}>
                    {sub.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={isSubActive
                      ? { background: 'rgba(237,116,35,0.12)', color: '#ED7423' }
                      : { background: '#f1f5f9', color: '#94a3b8' }
                    }
                  >
                    {isSubActive ? 'ON' : 'OFF'}
                  </span>
                  <Toggle
                    checked={isSubActive}
                    onChange={() => onToggleSubmodulo(sub.id, isSubActive, sub.nombre)}
                    disabled={!isModActive}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!hasSubmodulos && (
        <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-2 text-amber-600 text-xs">
          <AlertCircle size={13} />
          <span>Sin submódulos en el catálogo.</span>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function PanelControl({
  toast,
}: {
  toast: (m: string, t: 'success' | 'error') => void;
}) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [flowStatus, setFlowStatus] = useState<FlowStatus | null>(null);
  const [networkIp, setNetworkIp] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingEmpresa, setLoadingEmpresa] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title?: string;
    msg: string;
    type?: 'primary' | 'danger';
    action: () => Promise<void>;
  } | null>(null);

  // Cargar lista de empresas
  const loadEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companiesApi.listar();
      const list: Empresa[] = res.data?.data || res.data || [];
      const activas = list.filter((e) => e.activo);
      setEmpresas(activas);
      if (activas.length > 0 && !selectedEmpresaId) {
        setSelectedEmpresaId(activas[0].id);
      }
    } catch {
      toast('Error al cargar empresas', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedEmpresaId]);

  // Cargar detalle de la empresa seleccionada (incluye estado por módulo/submódulo)
  const loadEmpresa = useCallback(async (id: number) => {
    setLoadingEmpresa(true);
    try {
      const [compRes, flowRes] = await Promise.all([
        companiesApi.detalle(id.toString()),
        api.get('/modules/flow-status').catch(() => null),
      ]);
      const data: Empresa = compRes.data?.data || compRes.data;
      setEmpresa(data);
      if (flowRes) {
        setFlowStatus(flowRes.data?.data || null);
      }
    } catch {
      toast('Error al cargar módulos de la empresa', 'error');
    } finally {
      setLoadingEmpresa(false);
    }
  }, []);

  useEffect(() => {
    loadEmpresas();
    // Detectar IP de red desde la URL actual del admin
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      setNetworkIp(hostname);
    } else {
      // Intentar obtener la IP de red del backend
      api.get('/modules/network-info').then(r => {
        if (r.data?.data?.networkIp) setNetworkIp(r.data.data.networkIp);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (selectedEmpresaId) loadEmpresa(selectedEmpresaId);
  }, [selectedEmpresaId]);

  // ── Toggle módulo (con cascada en backend) ──
  const handleToggleModule = (moduloId: number, currentActive: boolean) => {
    if (!empresa) return;
    const mod = empresa.modulos.find((m) => m.moduloId === moduloId);
    const modNombre = mod?.modulo?.nombre ?? 'módulo';
    const nextActive = !currentActive;

    setConfirmData({
      title: nextActive ? 'Activar módulo completo' : 'Desactivar módulo completo',
      msg: nextActive
        ? `¿Activar el módulo "${modNombre}" para "${empresa.nombre}"? Esto activará todos sus submódulos automáticamente.`
        : `¿Desactivar el módulo "${modNombre}" para "${empresa.nombre}"? Todos sus submódulos quedarán desactivados.`,
      type: nextActive ? 'primary' : 'danger',
      action: async () => {
        try {
          await companiesApi.toggleModule({
            empresaId: empresa.id,
            moduloId,
            active: nextActive,
          });
          toast(
            nextActive
              ? `Módulo "${modNombre}" activado con todos sus submódulos`
              : `Módulo "${modNombre}" desactivado`,
            'success',
          );
          await loadEmpresa(empresa.id);
        } catch (err: any) {
          toast(err?.response?.data?.message || 'Error al cambiar módulo', 'error');
        }
      },
    });
  };

  // ── Toggle submódulo individual ──
  const handleToggleSubmodulo = (
    submoduloId: number,
    currentActive: boolean,
    nombre: string,
  ) => {
    if (!empresa) return;
    const nextActive = !currentActive;

    setConfirmData({
      title: nextActive ? 'Activar submódulo' : 'Desactivar submódulo',
      msg: `¿${nextActive ? 'Activar' : 'Desactivar'} el submódulo "${nombre}" para "${empresa.nombre}"?`,
      type: nextActive ? 'primary' : 'danger',
      action: async () => {
        try {
          await companiesApi.toggleSubmodule({
            empresaId: empresa.id,
            submoduloId,
            active: nextActive,
          });
          toast(
            nextActive ? `Submódulo "${nombre}" activado` : `Submódulo "${nombre}" desactivado`,
            'success',
          );
          await loadEmpresa(empresa.id);
        } catch (err: any) {
          toast(err?.response?.data?.message || 'Error al cambiar submódulo', 'error');
        }
      },
    });
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="page-enter max-w-6xl mx-auto">

      {/* ── Cabecera brand ──────────────────────────────────────────────── */}
      <div
        className="rounded-2xl mb-6 overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0C133A 0%, #1a2f6e 60%, #ED7423 200%)' }}
      >
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(237,116,35,0.18)', border: '1px solid rgba(237,116,35,0.35)' }}
            >
              <SlidersHorizontal size={22} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">Panel de Control</h2>
              <p className="text-white/60 text-sm mt-0.5">
                Activa y desactiva módulos y submódulos por empresa
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            onClick={() => selectedEmpresaId && loadEmpresa(selectedEmpresaId)}
            disabled={loadingEmpresa}
          >
            <RefreshCw size={14} className={loadingEmpresa ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Barra de servicios */}
        <div
          className="px-6 py-3 flex flex-wrap gap-x-6 gap-y-1"
          style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {[
            { label: 'Admin',      url: `http://localhost:5200`,      net: `http://${networkIp || '…'}:5200` },
            { label: 'OCR',        url: 'http://localhost:5181',       net: `http://${networkIp || '…'}:5181` },
            { label: 'Formulario', url: 'http://localhost:5182',       net: `http://${networkIp || '…'}:5182` },
            { label: 'Emisión',    url: 'http://localhost:5183',       net: `http://${networkIp || '…'}:5183` },
            { label: 'Pagos',      url: 'http://localhost:5184',       net: `http://${networkIp || '…'}:5184` },
            { label: 'RCV Full',   url: 'http://localhost:5180',       net: `http://${networkIp || '…'}:5180` },
          ].map(s => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-medium text-white/60 hover:text-white transition-colors"
            >
              <ExternalLink size={10} />
              <span className="text-white/80 font-bold">{s.label}</span>
              <span className="hidden sm:inline">{s.net}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Selector de empresa */}
      {empresas.length > 1 && (
        <div className="card p-4 mb-6">
          <label className="label text-xs mb-2 block">Empresa</label>
          <select
            className="input max-w-sm"
            value={selectedEmpresaId ?? ''}
            onChange={(e) => setSelectedEmpresaId(Number(e.target.value))}
          >
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} — {e.rif}
              </option>
            ))}
          </select>
        </div>
      )}

      {empresas.length === 0 && (
        <div className="card p-12 text-center text-slate-400">
          <p className="text-3xl mb-3">🏢</p>
          <p className="font-semibold">No hay empresas activas en el sistema.</p>
        </div>
      )}

      {/* Módulos de la empresa */}
      {empresa && (
        <>
          {/* Info empresa */}
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
            {empresa.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">{empresa.nombre}</p>
            <p className="text-xs text-slate-400">{empresa.rif}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {empresa.modulos?.filter((m) => m.activo).length ?? 0} activos
            </span>
            <span className="text-xs text-slate-400">
              / {empresa.modulos?.length ?? 0} totales
            </span>
          </div>
        </div>

          {/* ── Banner Flujo Completo ── */}
          {flowStatus && (
            <div
              className="mb-5 rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all overflow-hidden relative"
              style={flowStatus.allModulesActive
                ? { borderColor: 'rgba(237,116,35,0.3)', background: 'rgba(237,116,35,0.05)' }
                : { borderColor: '#fde68a', background: '#fffbeb' }
              }
            >
              {/* Decorative stripe */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: flowStatus.allModulesActive ? '#ED7423' : '#f59e0b' }}
              />
              <div className="flex items-center gap-3 flex-1 pl-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={flowStatus.allModulesActive
                    ? { background: 'rgba(237,116,35,0.12)' }
                    : { background: '#fef3c7' }
                  }
                >
                  {flowStatus.allModulesActive ? '🛡️' : '⚠️'}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: flowStatus.allModulesActive ? '#0C133A' : '#92400e' }}>
                    {flowStatus.allModulesActive ? 'Flujo RCV completo activo' : 'Flujo incompleto'}
                  </p>
                  <p className="text-xs mt-0.5 text-slate-500">
                    {flowStatus.allModulesActive
                      ? 'Todos los módulos activos — el flujo unificado está disponible.'
                      : `${flowStatus.modules.filter(m => m.activo).length}/${flowStatus.modules.length} módulos activos.`}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {flowStatus.modules.sort((a,b) => a.orden - b.orden).map(m => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={m.activo
                          ? { background: 'rgba(237,116,35,0.12)', color: '#ED7423' }
                          : { background: '#f1f5f9', color: '#94a3b8' }
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.activo ? '#ED7423' : '#cbd5e1' }} />
                        {m.nombre.split('—')[0].trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {flowStatus.allModulesActive && (
                <button
                  onClick={async () => {
                    try {
                      const r = await api.post('/flow/start');
                      const url = r.data?.data?.firstUrl;
                      if (url) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      } else {
                        toast('No se pudo iniciar el flujo encadenado', 'error');
                      }
                    } catch {
                      // Fallback al monolítico si el bridge falla
                      window.open(flowStatus.fullFlowUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-sm hover:shadow-lg hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #ED7423, #0C133A)' }}
                  title="Inicia el flujo encadenado entre los 4 módulos seccionados"
                >
                  <Play size={14} fill="white" />
                  Iniciar flujo encadenado
                </button>
              )}
            </div>
          )}

          {loadingEmpresa ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size={28} />
            </div>
          ) : empresa.modulos && empresa.modulos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {empresa.modulos.map((moduloEmpresa) => (
                <ModuloCard
                  key={moduloEmpresa.moduloId}
                  moduloEmpresa={moduloEmpresa}
                  networkIp={networkIp}
                  onToggleModule={handleToggleModule}
                  onToggleSubmodulo={handleToggleSubmodulo}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center text-slate-400">
              <p className="text-3xl mb-3">🧩</p>
              <p className="font-semibold">
                No hay módulos en el catálogo. Crea uno en la sección{' '}
                <span className="text-orange-500">Módulos</span>.
              </p>
            </div>
          )}
        </>
      )}

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
