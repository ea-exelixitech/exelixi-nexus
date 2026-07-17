import React, { useState, FormEvent } from 'react';
import { authApi, setToken } from '../api';
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { Spinner } from '../components/ui';
import { publicAsset } from '../lib/app-base';

const C = {
  oxford:  '#0C133A',
  pumpkin: '#ED7423',
  sky:     '#05C6DF',
} as const;

/* Hexagon pattern decorativo (replica el isotipo Exélixi a baja opacidad) */
function HexagonMark({ size = 280, opacity = 0.08, color = '#FFFFFF' }: { size?: number; opacity?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ opacity }}
      aria-hidden
    >
      <defs>
        <clipPath id="hex-clip">
          <polygon points="100,5 188,52 188,148 100,195 12,148 12,52" />
        </clipPath>
      </defs>
      {/* Hexagon outline */}
      <polygon
        points="100,5 188,52 188,148 100,195 12,148 12,52"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
      {/* Inner X-pattern (líneas chevron concéntricas) */}
      <g clipPath="url(#hex-clip)" stroke={color} strokeWidth="2.5" fill="none">
        {[0, 12, 24, 36, 48, 60, 72].map((d, i) => (
          <g key={i}>
            <path d={`M ${100 - d} 100 L ${100 - d - 30} ${100 - 50} M ${100 - d} 100 L ${100 - d - 30} ${100 + 50}`} />
            <path d={`M ${100 + d} 100 L ${100 + d + 30} ${100 - 50} M ${100 + d} 100 L ${100 + d + 30} ${100 + 50}`} />
          </g>
        ))}
        <line x1="100" y1="0" x2="100" y2="200" />
      </g>
    </svg>
  );
}

export default function Login({ onLogin }: { onLogin: (u: any, token: string) => void }) {
  const [email,        setEmail]        = useState('admin@exelixi.com');
  const [password,     setPassword]     = useState('Admin.123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await authApi.login(email, password);
      const token = r.data.token;
      setToken(token);
      const meRes = await authApi.me();
      const meData = meRes.data?.data || meRes.data;
      const user = meData.user
        ? { ...meData.user, empresa: meData.empresa, permissions: meData.permissions }
        : meData;
      onLogin(user, token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F8FA' }}>

      {/* ── Panel izquierdo (brand) ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[55%] xl:w-[52%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${C.oxford} 0%, #1a2255 60%, #07092a 100%)` }}
      >
        {/* Patrón de hexágonos decorativo */}
        <div className="absolute -top-20 -right-20 pointer-events-none">
          <HexagonMark size={420} opacity={0.06} color="#ffffff" />
        </div>
        <div className="absolute -bottom-32 -left-24 pointer-events-none float-slow">
          <HexagonMark size={360} opacity={0.04} color={C.pumpkin} />
        </div>
        <div className="absolute top-1/3 right-1/4 pointer-events-none">
          <HexagonMark size={140} opacity={0.10} color={C.sky} />
        </div>

        {/* Glow naranja */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500, height: 500,
            background: `radial-gradient(circle, ${C.pumpkin}20 0%, transparent 70%)`,
            bottom: -100, right: -100,
          }}
        />

        {/* Logo + heading */}
        <div className="relative z-10">
          <img
            src={publicAsset('logo-dark-bg.png')}
            alt="Exélixi Technology"
            className="h-14 w-auto object-contain mb-16"
          />

          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold mb-6"
            style={{
              background: 'rgba(237,116,35,0.15)',
              color: C.pumpkin,
              border: '1px solid rgba(237,116,35,0.35)',
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-display)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full pulse-pumpkin" style={{ background: C.pumpkin }} />
            PLATAFORMA SAAS
          </div>

          <h1
            className="text-4xl xl:text-5xl text-white leading-[1.05] mb-5"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            Gestiona tus<br />
            <span style={{ color: C.pumpkin }}>módulos</span>{' '}
            <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontWeight: 500, color: C.sky }}>
              en vivo
            </span>
          </h1>

          <p className="text-white/55 text-base leading-relaxed max-w-md">
            Plataforma centralizada para administrar el ciclo completo de emisión
            de pólizas RCV, controlar empresas y supervisar tus módulos.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-3 max-w-md">
          {[
            { n: '4',     l: 'Módulos RCV',          c: C.pumpkin },
            { n: '24/7',  l: 'Disponibilidad',       c: C.sky     },
            { n: '100%',  l: 'Configuración live',   c: C.pumpkin },
            { n: 'v2.0',  l: 'Plataforma',           c: C.sky     },
          ].map(s => (
            <div
              key={s.l}
              className="rounded-xl p-4 transition-all hover:translate-y-[-2px]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p
                className="text-2xl text-white"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}
              >
                {s.n}
              </p>
              <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full" style={{ background: s.c }} />
                {s.l}
              </p>
            </div>
          ))}
        </div>

        {/* Franja inferior */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${C.pumpkin}, ${C.sky}, transparent)` }}
        />
      </div>

      {/* ── Panel derecho (form) ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        {/* Decoración sutil en mobile */}
        <div className="lg:hidden absolute -top-32 -right-32 opacity-30 pointer-events-none">
          <HexagonMark size={300} opacity={0.5} color={C.pumpkin} />
        </div>

        <div className="w-full max-w-sm relative z-10">

          {/* Logo mobile */}
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <img
              src={publicAsset('logo-color.png')}
              alt="Exélixi"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{
              background: 'rgba(237,116,35,0.10)',
              color: C.pumpkin,
              border: '1px solid rgba(237,116,35,0.20)',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-display)',
            }}
          >
            <Shield size={12} />
            Acceso seguro
          </div>

          <h2
            className="text-3xl leading-tight"
            style={{ color: C.oxford, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            Bienvenido<br />
            <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontWeight: 500 }}>
              de vuelta
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 mb-8">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@exelixi.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  className="input pr-10 w-full"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 text-base mt-2"
              disabled={loading}
            >
              {loading ? (
                <><Spinner /> Verificando…</>
              ) : (
                <>Iniciar sesión <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: '#9aa0aa', fontFamily: 'var(--font-display)' }}>
                Exélixi Technology
              </span>
              <span className="flex items-center gap-1.5" style={{ color: '#9aa0aa' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.sky }} />
                v2.0 — Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
