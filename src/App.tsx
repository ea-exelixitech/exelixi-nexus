import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { authApi, orgsApi, catalogApi, apiKeysApi, usersApi, setToken, clearToken } from './api';

type Page = 'dashboard' | 'clientes' | 'modulos' | 'suscripciones' | 'apikeys' | 'usuarios';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  dashboard: () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="2" width="7" height="7" rx="2"/><rect x="11" y="2" width="7" height="7" rx="2"/><rect x="2" y="11" width="7" height="7" rx="2"/><rect x="11" y="11" width="7" height="7" rx="2"/></svg>,
  clients:   () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M2 17c0-2.8 2.7-5 6-5s6 2.2 6 5"/><circle cx="8" cy="7" r="3"/><path d="M16 12c1.8.5 3 1.9 3 3.5"/><circle cx="15" cy="6" r="2.5"/></svg>,
  modules:   () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M10 2L2 6l8 4 8-4-8-4zM2 14l8 4 8-4M2 10l8 4 8-4"/></svg>,
  subs:      () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M4 5h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M4 5V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/><path d="M8 10h4M10 8v4"/></svg>,
  apikeys:   () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><circle cx="7" cy="13" r="4"/><path d="m10.5 9.5 7-7M16 5l1.5 1.5M13.5 5l1 1"/></svg>,
  users:     () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><circle cx="8" cy="6" r="3"/><path d="M2 17c0-3 2.7-5 6-5 1.2 0 2.3.3 3.2.8"/><circle cx="16" cy="14" r="3"/><path d="M16 12v2l1 1"/></svg>,
  plus:      () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><path d="M8 3v10M3 8h10"/></svg>,
  check:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.2"><path d="M13.5 3.5 6 11 2.5 7.5"/></svg>,
  x:         () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><path d="M12 4 4 12M4 4l8 8"/></svg>,
  copy:      () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6"><rect x="6" y="6" width="8" height="8" rx="1.5"/><path d="M10 4H4a1.5 1.5 0 0 0-1.5 1.5V12"/></svg>,
  logout:    () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M13 14.5 17 10l-4-4.5M17 10H7M7 17H4a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 4 3h3"/></svg>,
  menu:      () => <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M3 5h14M3 10h14M3 15h14"/></svg>,
  close:     () => <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M15 5 5 15M5 5l10 10"/></svg>,
  refresh:   () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7"><path d="M14 8A6 6 0 1 1 8 2a6 6 0 0 1 4.24 1.76L14 5.5"/><path d="M14 2v3.5h-3.5"/></svg>,
  bolt:      () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 2 4 11h6l-1 7 7-10h-6l1-6z"/></svg>,
  eye:       () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6"><path d="M1.5 8s2.5-5 6.5-5 6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5z"/><circle cx="8" cy="8" r="2"/></svg>,
  warning:   () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7"><path d="M8 6v3M8 11.5v.5"/><path d="M6.3 2.5 1 13h14L9.7 2.5a2 2 0 0 0-3.4 0z"/></svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }: { size?: number }) {
  return <div style={{ width: size, height: size }} className="border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700'}`}>
      {copied ? <><Icon.check /> Copiado</> : <><Icon.copy /> Copiar</>}
    </button>
  );
}

const BADGE: Record<string, string> = {
  ACTIVE: 'badge badge-green', TRIAL: 'badge badge-blue', SUSPENDED: 'badge badge-red',
  INACTIVE: 'badge badge-gray', BETA: 'badge badge-amber', DEPRECATED: 'badge badge-gray',
  REVOKED: 'badge badge-red', SUPERADMIN: 'badge badge-violet', ADMIN: 'badge badge-blue', CLIENT: 'badge badge-gray',
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, size = '' }: { title: string; onClose: () => void; children: React.ReactNode; size?: string }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={size === 'lg' ? 'modal-box-lg' : 'modal-box'}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="btn-icon bg-slate-50 hover:bg-slate-100 text-slate-500"><Icon.x /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }: { msg: string; type: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl text-sm font-medium max-w-sm ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
      style={{ animation: 'slideUp 0.2s ease' }}>
      {type === 'success' ? <Icon.check /> : <Icon.warning />}
      <span>{msg}</span>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100"><Icon.x /></button>
    </div>
  );
}

// ─── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (u: any, token: string) => void }) {
  const [email, setEmail] = useState('admin@exelitech.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await authApi.login(email, password);
      setToken(r.data.accessToken); onLogin(r.data.user, r.data.accessToken);
    } catch (err: any) { setError(err.response?.data?.message || 'Credenciales incorrectas'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/30" style={{ width: 100 + i * 120, height: 100 + i * 120, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"><Icon.bolt /></div>
            <span className="text-xl font-extrabold tracking-tight">ExelixiTech</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">Plataforma de<br />Módulos SaaS</h1>
          <p className="text-violet-200 text-lg leading-relaxed">Gestiona clientes, activa módulos y controla API Keys desde un solo lugar.</p>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { n: '3', l: 'Módulos disponibles' }, { n: '2', l: 'Clientes activos' },
            { n: '1', l: 'API Key generada' }, { n: '100%', l: 'Uptime garantizado' },
          ].map(s => (
            <div key={s.l} className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-2xl font-extrabold">{s.n}</p>
              <p className="text-violet-200 text-xs mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white"><Icon.bolt /></div>
            <span className="text-xl font-extrabold text-slate-900">ExelixiTech</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Bienvenido de vuelta</h2>
          <p className="text-slate-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@exelitech.com" required autoFocus />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? <><Spinner /> Verificando…</> : 'Iniciar sesión →'}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-6">Panel de administración · ExelixiTech v1.0</p>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }: { label: string; value: number | string; icon: string; color: string; sub?: string }) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{value ?? '—'}</p>
        <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ stats, user }: { stats: any; user: any }) {
  return (
    <div className="page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen general de la plataforma ExelixiTech</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Clientes registrados" value={stats.orgs} icon="🏢" color="violet" />
        <StatCard label="Módulos en catálogo" value={stats.modules} icon="🧩" color="blue" />
        <StatCard label="Suscripciones activas" value={stats.subs} icon="✅" color="emerald" />
        <StatCard label="API Keys emitidas" value={stats.keys} icon="🔑" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Flujo */}
        <div className="card p-6 lg:col-span-2">
          <p className="text-sm font-bold text-slate-900 mb-1">Flujo de activación de un cliente</p>
          <p className="text-xs text-slate-500 mb-5">Sigue estos pasos para que un cliente acceda a su módulo</p>
          <div className="space-y-3">
            {[
              { n: 1, title: 'Crear el cliente', desc: 'Ve a Clientes → Nuevo Cliente. Ingresa nombre y datos de contacto.', color: 'violet' },
              { n: 2, title: 'Crear usuario de acceso', desc: 'Ve a Usuarios → Nuevo Usuario. Asígna el rol CLIENT y la organización.', color: 'blue' },
              { n: 3, title: 'Activar el módulo', desc: 'Ve a Suscripciones → Asignar Módulo. Selecciona cliente y módulo.', color: 'emerald' },
              { n: 4, title: 'Generar API Key', desc: 'Ve a API Keys → Generar. Copia la clave y entrégala al cliente.', color: 'rose' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${s.color === 'violet' ? 'bg-violet-100 text-violet-700' : s.color === 'blue' ? 'bg-blue-100 text-blue-700' : s.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{s.n}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Módulos */}
        <div className="card p-6">
          <p className="text-sm font-bold text-slate-900 mb-1">Módulos disponibles</p>
          <p className="text-xs text-slate-500 mb-5">Ecosistema de la plataforma</p>
          <div className="space-y-3">
            {[
              { icon: '🛡️', name: 'Seguros RCV', desc: 'Emisión de pólizas', status: 'ACTIVE', color: 'bg-sky-50' },
              { icon: '💳', name: 'Pagos Online', desc: 'Pasarela de pagos', status: 'BETA', color: 'bg-purple-50' },
              { icon: '📍', name: 'Tracking Flota', desc: 'GPS en tiempo real', status: 'BETA', color: 'bg-amber-50' },
              { icon: '📊', name: 'Analytics', desc: 'Reportes y métricas', status: 'BETA', color: 'bg-slate-50' },
            ].map(m => (
              <div key={m.name} className={`flex items-center gap-3 p-3 rounded-xl ${m.color} border border-slate-100`}>
                <span className="text-xl w-8 text-center">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.desc}</p>
                </div>
                <span className={BADGE[m.status] ?? 'badge badge-gray'}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clientes ──────────────────────────────────────────────────────────────────
function Clientes({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', contactEmail: '', contactPhone: '', notas: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => { setLoading(true); orgsApi.listar().then(r => setOrgs(r.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const crear = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await orgsApi.crear(form); setShowModal(false); setForm({ nombre: '', contactEmail: '', contactPhone: '', notas: '' }); load(); toast('Cliente creado exitosamente', 'success'); }
    catch (err: any) { toast(err.response?.data?.message || 'Error al crear cliente', 'error'); }
    finally { setSaving(false); }
  };

  const filtered = orgs.filter(o => o.nombre.toLowerCase().includes(search.toLowerCase()) || o.contactEmail?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1">Empresas registradas en la plataforma</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setShowModal(true)}><Icon.plus /> Nuevo cliente</button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <input className="input max-w-xs" placeholder="Buscar cliente…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-ghost ml-auto" onClick={load}><Icon.refresh /> Actualizar</button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size={24} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Empresa', 'Slug', 'Contacto', 'Estado', 'Registrado', 'Acciones'].map(h => <th key={h} className="th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 shrink-0">
                          {o.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{o.nombre}</p>
                          {o.notas && <p className="text-xs text-slate-400 truncate max-w-[200px]">{o.notas}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="td"><code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-mono">{o.slug}</code></td>
                    <td className="td">
                      <p className="text-sm text-slate-700">{o.contactEmail || '—'}</p>
                      {o.contactPhone && <p className="text-xs text-slate-400">{o.contactPhone}</p>}
                    </td>
                    <td className="td"><span className={BADGE[o.status] ?? 'badge badge-gray'}>{o.status}</span></td>
                    <td className="td text-sm text-slate-500">{new Date(o.createdAt).toLocaleDateString('es-VE')}</td>
                    <td className="td">
                      <div className="flex gap-2">
                        {o.status !== 'SUSPENDED' ? (
                          <button className="btn-danger text-xs py-1.5 px-3" onClick={() => orgsApi.suspender(o.id).then(() => { load(); toast('Cliente suspendido', 'success'); })}>Suspender</button>
                        ) : (
                          <button className="btn-success text-xs py-1.5 px-3" onClick={() => orgsApi.activar(o.id).then(() => { load(); toast('Cliente activado', 'success'); })}>Activar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="td text-center py-16 text-slate-400">
                    <div className="text-3xl mb-2">🏢</div>
                    <p className="font-medium">Sin clientes{search ? ' con ese filtro' : ' registrados'}</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Nuevo cliente" onClose={() => setShowModal(false)}>
          <form onSubmit={crear} className="space-y-4">
            <div><label className="label">Nombre de la empresa *</label><input className="input" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ridery C.A." required /></div>
            <div><label className="label">Correo de contacto</label><input className="input" type="email" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} placeholder="contacto@empresa.com" /></div>
            <div><label className="label">Teléfono</label><input className="input" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} placeholder="+58 412-0000000" /></div>
            <div><label className="label">Notas internas</label><textarea className="input resize-none h-20" value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Observaciones opcionales…" /></div>
            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? <><Spinner /> Creando…</> : 'Crear cliente'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Módulos ───────────────────────────────────────────────────────────────────
function Modulos({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ slug: '', nombre: '', descripcion: '', urlBase: '', icon: '🔧', color: '#7c3aed', precio: '0', version: '1.0.0' });
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); catalogApi.listarModulos().then(r => setMods(r.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const crear = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await catalogApi.crearModulo({ ...form, precio: parseFloat(form.precio) }); setShowModal(false); load(); toast('Módulo creado', 'success'); }
    catch (err: any) { toast(err.response?.data?.message || 'Error al crear módulo', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Catálogo de Módulos</h1>
          <p className="text-slate-500 mt-1">Servicios disponibles en la plataforma</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setShowModal(true)}><Icon.plus /> Nuevo módulo</button>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-16"><Spinner size={24} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {mods.map(m => (
            <div key={m.id} className="card p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${m.color}15`, border: `1.5px solid ${m.color}30` }}>{m.icon || '🔧'}</div>
                <span className={BADGE[m.status] ?? 'badge badge-gray'}>{m.status}</span>
              </div>
              <p className="font-bold text-slate-900 text-base">{m.nombre}</p>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{m.descripcion || 'Sin descripción'}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <code className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-lg font-mono">{m.slug}</code>
                  <p className="text-xs text-slate-400 mt-1">v{m.version}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-slate-900">${Number(m.precio).toFixed(2)}</p>
                  <p className="text-xs text-slate-400">/mes</p>
                </div>
              </div>
              {m.urlBase && <p className="text-xs text-slate-400 mt-2 truncate">{m.urlBase}</p>}
            </div>
          ))}
          {mods.length === 0 && (
            <div className="card p-12 text-center text-slate-400 col-span-3">
              <div className="text-3xl mb-2">🧩</div>
              <p className="font-medium">Sin módulos en el catálogo</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title="Nuevo módulo" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={crear} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Slug único *</label><input className="input" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase() }))} placeholder="seguros-rcv" required /></div>
              <div><label className="label">Nombre *</label><input className="input" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Módulo Seguros" required /></div>
            </div>
            <div><label className="label">Descripción</label><input className="input" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Breve descripción del módulo" /></div>
            <div><label className="label">URL base (donde corre el módulo)</label><input className="input" value={form.urlBase} onChange={e => setForm(p => ({ ...p, urlBase: e.target.value }))} placeholder="https://seguros.tudominio.com" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label">Ícono (emoji)</label><input className="input text-center text-xl" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} /></div>
              <div><label className="label">Color</label><input className="input h-[42px] cursor-pointer" type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} /></div>
              <div><label className="label">Precio $ / mes</label><input className="input" type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} min="0" step="0.01" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? <><Spinner /> Creando…</> : 'Crear módulo'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Suscripciones ─────────────────────────────────────────────────────────────
function Suscripciones({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [subs, setSubs] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ orgId: '', modId: '', expiresAt: '' });
  const [saving, setSaving] = useState(false);
  const [filterOrg, setFilterOrg] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([catalogApi.listarSubs(), orgsApi.listar(), catalogApi.listarModulos()])
      .then(([s, o, m]) => { setSubs(s.data); setOrgs(o.data); setMods(m.data); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, []);

  const asignar = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await catalogApi.activarModulo(form.orgId, form.modId, form.expiresAt ? { expiresAt: form.expiresAt } : {}); setShowModal(false); load(); toast('Módulo asignado y activado', 'success'); }
    catch (err: any) { toast(err.response?.data?.message || 'Error', 'error'); }
    finally { setSaving(false); }
  };

  const filtered = filterOrg ? subs.filter(s => s.organizationId === filterOrg) : subs;

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Suscripciones</h1>
          <p className="text-slate-500 mt-1">Control de acceso de clientes a módulos</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setShowModal(true)}><Icon.plus /> Asignar módulo</button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <select className="input max-w-xs" value={filterOrg} onChange={e => setFilterOrg(e.target.value)}>
            <option value="">Todos los clientes</option>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
          <button className="btn-ghost ml-auto" onClick={load}><Icon.refresh /> Actualizar</button>
        </div>
        {loading ? <div className="flex justify-center py-16"><Spinner size={24} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Cliente', 'Módulo', 'Estado', 'Vencimiento', 'Activado', 'Acción'].map(h => <th key={h} className="th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">{s.organization?.nombre?.charAt(0)}</div>
                        <span className="font-medium text-slate-800">{s.organization?.nombre || '—'}</span>
                      </div>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{s.module?.icon || '🔧'}</span>
                        <span className="text-sm text-slate-700">{s.module?.nombre || '—'}</span>
                      </div>
                    </td>
                    <td className="td"><span className={BADGE[s.status] ?? 'badge badge-gray'}>{s.status}</span></td>
                    <td className="td text-sm text-slate-500">{s.expiresAt ? new Date(s.expiresAt).toLocaleDateString('es-VE') : <span className="text-emerald-600 font-medium">Sin vencimiento</span>}</td>
                    <td className="td text-sm text-slate-500">{new Date(s.activatedAt).toLocaleDateString('es-VE')}</td>
                    <td className="td">
                      {s.status === 'ACTIVE' ? (
                        <button className="btn-danger text-xs py-1.5 px-3" onClick={() => catalogApi.desactivarModulo(s.organizationId, s.moduleId).then(() => { load(); toast('Módulo desactivado', 'success'); })}>Desactivar</button>
                      ) : (
                        <button className="btn-success text-xs py-1.5 px-3" onClick={() => catalogApi.activarModulo(s.organizationId, s.moduleId).then(() => { load(); toast('Módulo activado', 'success'); })}>Activar</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="td text-center py-16 text-slate-400"><div className="text-3xl mb-2">📋</div><p className="font-medium">Sin suscripciones</p></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Asignar módulo a cliente" onClose={() => setShowModal(false)}>
          <form onSubmit={asignar} className="space-y-4">
            <div><label className="label">Cliente *</label>
              <select className="input" value={form.orgId} onChange={e => setForm(p => ({ ...p, orgId: e.target.value }))} required>
                <option value="">Selecciona un cliente…</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <div><label className="label">Módulo *</label>
              <select className="input" value={form.modId} onChange={e => setForm(p => ({ ...p, modId: e.target.value }))} required>
                <option value="">Selecciona un módulo…</option>
                {mods.map(m => <option key={m.id} value={m.id}>{m.icon} {m.nombre}</option>)}
              </select>
            </div>
            <div><label className="label">Fecha de vencimiento (dejar vacío = sin límite)</label><input className="input" type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} /></div>
            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? <><Spinner /> Asignando…</> : 'Asignar y activar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── API Keys ──────────────────────────────────────────────────────────────────
function ApiKeys({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [keys, setKeys] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [form, setForm] = useState({ orgId: '', modId: '', nombre: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiKeysApi.listarTodas(), orgsApi.listar(), catalogApi.listarModulos()])
      .then(([k, o, m]) => { setKeys(k.data); setOrgs(o.data); setMods(m.data); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, []);

  const generar = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await apiKeysApi.generar({ organizationId: form.orgId, moduleId: form.modId, nombre: form.nombre });
      setNewKey(r.data.apiKey); setShowModal(false); load(); toast('API Key generada exitosamente', 'success');
    } catch (err: any) { toast(err.response?.data?.message || 'Error', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">API Keys</h1>
          <p className="text-slate-500 mt-1">Claves de acceso por cliente y módulo</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setShowModal(true)}><Icon.plus /> Generar API Key</button>
      </div>

      {newKey && (
        <div className="card p-5 mb-6 border-emerald-200 bg-emerald-50" style={{ animation: 'slideUp .2s ease' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-xl shrink-0">🔑</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-emerald-800">API Key generada — guárdala ahora</p>
              <p className="text-xs text-emerald-600 mt-0.5 mb-3">Esta es la única vez que se mostrará el valor completo</p>
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-emerald-200">
                <code className="flex-1 text-xs font-mono text-slate-800 break-all">{newKey}</code>
                <CopyBtn text={newKey} />
              </div>
            </div>
          </div>
          <button className="btn-secondary text-xs mt-4" onClick={() => setNewKey(null)}>Cerrar aviso</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-600">{keys.length} key{keys.length !== 1 ? 's' : ''} registrada{keys.length !== 1 ? 's' : ''}</p>
          <button className="btn-ghost" onClick={load}><Icon.refresh /> Actualizar</button>
        </div>
        {loading ? <div className="flex justify-center py-16"><Spinner size={24} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Nombre', 'Prefijo', 'Cliente', 'Módulo', 'Estado', 'Último uso', 'Acción'].map(h => <th key={h} className="th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {keys.map(k => {
                  const org = orgs.find(o => o.id === k.organizationId);
                  const mod = mods.find(m => m.id === k.moduleId);
                  return (
                    <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                      <td className="td font-medium text-slate-800">{k.nombre || '—'}</td>
                      <td className="td"><code className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg font-mono">{k.keyPrefix}…</code></td>
                      <td className="td text-sm text-slate-600">{org?.nombre || '—'}</td>
                      <td className="td"><div className="flex items-center gap-1.5"><span>{mod?.icon || '🔧'}</span><span className="text-sm text-slate-600">{mod?.nombre || '—'}</span></div></td>
                      <td className="td"><span className={BADGE[k.status] ?? 'badge badge-gray'}>{k.status}</span></td>
                      <td className="td text-sm text-slate-500">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('es-VE') : <span className="text-slate-300">Nunca</span>}</td>
                      <td className="td">
                        {k.status === 'ACTIVE' && (
                          <button className="btn-danger text-xs py-1.5 px-3" onClick={() => { if (confirm('¿Revocar esta API Key? Esta acción no se puede deshacer.')) apiKeysApi.revocar(k.id).then(() => { load(); toast('API Key revocada', 'success'); }); }}>Revocar</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {keys.length === 0 && <tr><td colSpan={7} className="td text-center py-16 text-slate-400"><div className="text-3xl mb-2">🔑</div><p className="font-medium">Sin API Keys generadas</p></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Generar nueva API Key" onClose={() => setShowModal(false)}>
          <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4">⚠️ La clave completa solo se muestra una vez. Asegúrate de copiarla.</p>
          <form onSubmit={generar} className="space-y-4">
            <div><label className="label">Cliente *</label>
              <select className="input" value={form.orgId} onChange={e => setForm(p => ({ ...p, orgId: e.target.value }))} required>
                <option value="">Selecciona un cliente…</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <div><label className="label">Módulo *</label>
              <select className="input" value={form.modId} onChange={e => setForm(p => ({ ...p, modId: e.target.value }))} required>
                <option value="">Selecciona un módulo…</option>
                {mods.map(m => <option key={m.id} value={m.id}>{m.icon} {m.nombre}</option>)}
              </select>
            </div>
            <div><label className="label">Nombre descriptivo</label><input className="input" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="ej. Producción Ridery" /></div>
            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? <><Spinner /> Generando…</> : 'Generar API Key'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Usuarios ──────────────────────────────────────────────────────────────────
function Usuarios({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'CLIENT', firstName: '', lastName: '', organizationId: '' });
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); Promise.all([usersApi.listar(), orgsApi.listar()]).then(([u, o]) => { setUsers(u.data); setOrgs(o.data); }).finally(() => setLoading(false)); };
  useEffect(load, []);

  const crear = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await usersApi.crear(form); setShowModal(false); load(); toast('Usuario creado exitosamente', 'success'); }
    catch (err: any) { toast(err.response?.data?.message || 'Error', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Usuarios</h1>
          <p className="text-slate-500 mt-1">Administradores y usuarios de la plataforma</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setShowModal(true)}><Icon.plus /> Nuevo usuario</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Spinner size={24} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Usuario', 'Rol', 'Organización', 'Estado', 'Último acceso'].map(h => <th key={h} className="th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td"><span className={BADGE[u.role] ?? 'badge badge-gray'}>{u.role}</span></td>
                    <td className="td text-sm text-slate-600">{u.organization?.nombre || <span className="text-slate-300">—</span>}</td>
                    <td className="td"><span className={u.activo ? 'badge badge-green' : 'badge badge-red'}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="td text-sm text-slate-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('es-VE') : <span className="text-slate-300">Nunca</span>}</td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} className="td text-center py-16 text-slate-400"><div className="text-3xl mb-2">👤</div><p className="font-medium">Sin usuarios</p></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Nuevo usuario" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={crear} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Nombre</label><input className="input" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Juan" /></div>
              <div><label className="label">Apellido</label><input className="input" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Pérez" /></div>
            </div>
            <div><label className="label">Correo electrónico *</label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="usuario@empresa.com" required /></div>
            <div><label className="label">Contraseña *</label><input className="input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Rol</label>
                <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="CLIENT">Cliente</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="SUPERADMIN">Superadmin</option>
                </select>
              </div>
              <div><label className="label">Organización</label>
                <select className="input" value={form.organizationId} onChange={e => setForm(p => ({ ...p, organizationId: e.target.value }))}>
                  <option value="">Sin organización</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? <><Spinner /> Creando…</> : 'Crear usuario'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState<Page>('dashboard');
  const [stats, setStats] = useState({ orgs: 0, modules: 0, subs: 0, keys: 0 });
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => setToastMsg({ msg, type });

  useEffect(() => {
    const saved = localStorage.getItem('exelitech_token');
    if (saved) {
      setToken(saved);
      authApi.me().then(r => setUser(r.data)).catch(() => localStorage.removeItem('exelitech_token')).finally(() => setAuthChecked(true));
    } else { setAuthChecked(true); }
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([orgsApi.listar(), catalogApi.listarModulos(), catalogApi.listarSubs(), apiKeysApi.listarTodas()])
      .then(([o, m, s, k]) => setStats({ orgs: o.data.length, modules: m.data.length, subs: s.data.length, keys: k.data.length }))
      .catch(() => {});
  }, [user]);

  if (!authChecked) return null;
  if (!user) return <Login onLogin={(u, t) => { setToken(t); setUser(u); }} />;

  const NAV = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Icon.dashboard },
    { id: 'clientes' as Page, label: 'Clientes', icon: Icon.clients },
    { id: 'modulos' as Page, label: 'Módulos', icon: Icon.modules },
    { id: 'suscripciones' as Page, label: 'Suscripciones', icon: Icon.subs },
    { id: 'apikeys' as Page, label: 'API Keys', icon: Icon.apikeys },
    { id: 'usuarios' as Page, label: 'Usuarios', icon: Icon.users },
  ];

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false); };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar shadow-xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-violet-500/30 shrink-0">
            <Icon.bolt />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 leading-none">ExelixiTech</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Admin Panel</p>
          </div>
          <button className="lg:hidden ml-auto btn-icon btn-ghost" onClick={() => setSidebarOpen(false)}><Icon.close /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Menú principal</p>
          {NAV.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              className={`nav-item ${page === item.id ? 'nav-active' : 'nav-inactive'}`}>
              <item.icon />
              <span>{item.label}</span>
              {page === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.firstName || user.email.split('@')[0]}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <button onClick={() => { clearToken(); setUser(null); }} className="btn-ghost btn-icon text-slate-400 hover:text-red-500 shrink-0" title="Cerrar sesión">
              <Icon.logout />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center gap-4">
          <button className="lg:hidden btn-icon btn-ghost" onClick={() => setSidebarOpen(true)}><Icon.menu /></button>
          <div className="flex-1">
            <p className="font-bold text-slate-900 capitalize">{NAV.find(n => n.id === page)?.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${user.role === 'SUPERADMIN' ? 'badge-violet' : 'badge-blue'}`}>{user.role}</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {page === 'dashboard'     && <Dashboard stats={stats} user={user} />}
          {page === 'clientes'      && <Clientes toast={showToast} />}
          {page === 'modulos'       && <Modulos toast={showToast} />}
          {page === 'suscripciones' && <Suscripciones toast={showToast} />}
          {page === 'apikeys'       && <ApiKeys toast={showToast} />}
          {page === 'usuarios'      && <Usuarios toast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onDismiss={() => setToastMsg(null)} />}
    </div>
  );
}
