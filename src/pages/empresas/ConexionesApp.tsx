import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companiesApi } from '../../api';
import { Spinner, CopyBtn } from '../../components/ui';
import {
  ChevronLeft, Plug, RefreshCw, Eye, EyeOff,
  CheckCircle2, XCircle, Clock, WifiOff,
} from 'lucide-react';

interface ConexionRow {
  submoduloId: number;
  nombre: string;
  url: string | null;
  submoduloActivo: boolean;
  conexionActiva: boolean;
  tenantToken: string | null;
  tokenExpiresAt: string | null;
  estado: 'activo' | 'expirado' | 'sin_conexion' | 'inactivo';
}

const ESTADO_CONFIG = {
  activo:       { label: 'Activo',         icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
  expirado:     { label: 'Expirado',        icon: XCircle,      cls: 'text-red-600 bg-red-50' },
  sin_conexion: { label: 'Sin conexión',    icon: Clock,        cls: 'text-amber-600 bg-amber-50' },
  inactivo:     { label: 'Inactivo',        icon: WifiOff,      cls: 'text-slate-400 bg-slate-100' },
};

function TokenCell({ token }: { token: string }) {
  const [visible, setVisible] = useState(false);
  const masked = token.slice(0, 12) + '••••••••••••••••••••••' + token.slice(-6);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded select-all">
        {visible ? token : masked}
      </code>
      <button
        onClick={() => setVisible(v => !v)}
        title={visible ? 'Ocultar' : 'Mostrar'}
        className="btn-icon bg-slate-100 hover:bg-slate-200 text-slate-500"
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <CopyBtn text={token} />
    </div>
  );
}

export default function ConexionesApp({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rows, setRows] = useState<ConexionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [empresaNombre, setEmpresaNombre] = useState('');

  const cargar = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);
    try {
      const [tokensRes, empresaRes] = await Promise.all([
        companiesApi.obtenerTokensConexion(Number(id)),
        companiesApi.detalle(id!),
      ]);
      setRows(tokensRes.data?.data ?? []);
      setEmpresaNombre(empresaRes.data?.data?.nombre ?? '');
    } catch {
      toast('No se pudieron cargar los tokens de conexión', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/empresas/${id}`)} className="btn-icon bg-slate-100 hover:bg-slate-200 text-slate-600">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Plug size={20} className="text-orange-500" />
            Conexiones de aplicaciones
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{empresaNombre}</p>
        </div>
        <button
          onClick={() => cargar(false)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Explicación */}
      <div className="card bg-orange-50 border border-orange-200 text-sm text-orange-800 p-4 rounded-xl space-y-1">
        <p className="font-semibold">¿Cómo funciona?</p>
        <ol className="list-decimal list-inside space-y-0.5 text-orange-700">
          <li>Copia el <strong>API Key</strong> del submódulo y entrégalo a la aplicación cliente.</li>
          <li>La app lo intercambia en <code className="bg-orange-100 px-1 rounded">POST /api/access/token</code> → recibe un <em>access_token</em> de 1 hora.</li>
          <li>En cada petición del usuario llama a <code className="bg-orange-100 px-1 rounded">POST /api/access/heartbeat</code> → renueva la sesión +8h.</li>
          <li>Si el cliente está inactivo 8h sin hacer heartbeat, la sesión expira automáticamente.</li>
        </ol>
      </div>

      {/* Tabla */}
      {rows.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <Plug size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay submódulos configurados para esta empresa.</p>
          <p className="text-sm mt-1">Activa submódulos desde el perfil de la empresa.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-left py-3 px-4 font-semibold">Submódulo</th>
                <th className="text-left py-3 px-4 font-semibold">Estado</th>
                <th className="text-left py-3 px-4 font-semibold">Última actividad</th>
                <th className="text-left py-3 px-4 font-semibold">API Key (tenantToken)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => {
                const cfg = ESTADO_CONFIG[row.estado];
                const Icon = cfg.icon;
                const expira = row.tokenExpiresAt
                  ? new Date(row.tokenExpiresAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
                  : null;

                return (
                  <tr key={row.submoduloId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{row.nombre}</p>
                      {row.url && (
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{row.url}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
                        <Icon size={13} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {expira ? (
                        <span title="La sesión se renueva con cada heartbeat">
                          {row.estado === 'activo' ? 'Expira: ' : 'Expiró: '}{expira}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {row.tenantToken ? (
                        <TokenCell token={row.tenantToken} />
                      ) : (
                        <span className="text-slate-300 text-xs">
                          {row.conexionActiva ? '—' : 'Submódulo inactivo'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
