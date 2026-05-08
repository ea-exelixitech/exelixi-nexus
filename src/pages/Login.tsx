import React, { useState, FormEvent } from 'react';
import { authApi, setToken } from '../api';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { Spinner } from '../components/ui';

export default function Login({ onLogin }: { onLogin: (u: any, token: string) => void }) {
  const [email, setEmail] = useState('admin@exelixi.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await authApi.login(email, password);
      const token = r.data.token;
      setToken(token);
      
      const meRes = await authApi.me();
      const meData = meRes.data?.data || meRes.data;
      const user = meData.user ? { ...meData.user, empresa: meData.empresa, permissions: meData.permissions } : meData;
      
      onLogin(user, token);
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
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"><Zap size={20} /></div>
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
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white"><Zap size={20} /></div>
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
              <div className="relative">
                <input className="input pr-10 w-full" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-violet-600 transition-colors" onClick={() => setShowPassword(!showPassword)} title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
