import React, { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Key, Blocks,
  X, LogOut, Menu, Mail, Briefcase, ChevronLeft, ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { ConfirmDialog, Modal } from './ui';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard,   path: '/dashboard' },
  { id: 'panel',      label: 'Panel de Control',   icon: SlidersHorizontal, path: '/panel' },
  { id: 'empresas',   label: 'Empresas',           icon: Building2,         path: '/empresas' },
  { id: 'usuarios',   label: 'Usuarios',           icon: Users,             path: '/usuarios' },
  { id: 'roles',      label: 'Roles y Permisos',   icon: Key,               path: '/roles' },
  { id: 'modulos',    label: 'Módulos',            icon: Blocks,            path: '/modulos' },
];

const C = {
  oxford:  '#0C133A',
  pumpkin: '#ED7423',
  sky:     '#05C6DF',
} as const;

export default function Layout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [isCollapsed,      setIsCollapsed]      = useState(false);
  const [confirmLogout,    setConfirmLogout]    = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const location   = useLocation();
  const activePath = location.pathname.split('/')[1] || 'dashboard';
  const activeLabel = NAV_ITEMS.find(n => n.id === activePath)?.label ?? 'Panel';

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F8FA' }}>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(12,19,58,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={[
          'sidebar shadow-2xl lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:block',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
        ].join(' ')}
      >
        {/* Logo block */}
        <div
          className="relative px-4 py-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Tiny accent stripe */}
          <span
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: `linear-gradient(180deg, ${C.pumpkin}, ${C.sky})` }}
          />

          {isCollapsed ? (
            <div className="w-9 h-9 mx-auto flex items-center justify-center shrink-0">
              <img
                src="/logo-dark-bg.png"
                alt="Exélixi"
                className="h-8 w-auto object-contain"
              />
            </div>
          ) : (
            <img
              src="/logo-dark-bg.png"
              alt="Exélixi Technology"
              className="h-10 w-auto object-contain"
            />
          )}

          {/* Cerrar mobile */}
          <button
            className="lg:hidden ml-auto text-white/60 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-7 w-6 h-6 rounded-full items-center justify-center text-xs transition-all shadow-md hover:scale-110"
            style={{ background: C.pumpkin, color: 'white' }}
            title={isCollapsed ? 'Expandir' : 'Colapsar'}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden space-y-0.5">
          {!isCollapsed && (
            <p
              className="text-[10px] font-bold uppercase px-3 py-2 truncate"
              style={{ color: 'rgba(255,255,255,0.32)', letterSpacing: '0.14em', fontFamily: 'var(--font-display)' }}
            >
              Menú principal
            </p>
          )}
          {isCollapsed && <div className="h-3" />}

          {NAV_ITEMS.map(item => {
            const isActive = activePath === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={[
                  'nav-item',
                  isActive ? 'nav-active' : 'nav-inactive',
                  isCollapsed ? 'justify-center px-0' : '',
                ].join(' ')}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  size={18}
                  strokeWidth={1.8}
                  className="shrink-0"
                  style={{ color: isActive ? C.pumpkin : undefined }}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 pulse-pumpkin"
                    style={{ background: C.pumpkin }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {!isCollapsed && (
            <div
              className="mb-3 p-3 rounded-xl text-[11px] leading-tight"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-white/50 mb-0.5">Versión actual</p>
              <p className="text-white font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Exélixi Nexus v2.0
              </p>
              <p className="text-white/40 mt-0.5 truncate">Plataforma SaaS</p>
            </div>
          )}
          <button
            onClick={() => setConfirmLogout(true)}
            className={[
              'nav-item text-red-300 hover:bg-red-900/25 hover:text-red-200',
              isCollapsed ? 'justify-center px-0' : '',
            ].join(' ')}
            title={isCollapsed ? 'Salir' : undefined}
          >
            <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Contenido ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Header */}
        <header
          className="sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center gap-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #EAECEF',
          }}
        >
          <button
            className="lg:hidden btn-icon btn-ghost"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase hidden sm:block"
                style={{ color: '#9aa0aa', letterSpacing: '0.12em', fontFamily: 'var(--font-display)' }}
              >
                Exélixi Admin
              </span>
              <span className="hidden sm:block" style={{ color: '#cbd5e1' }}>/</span>
              <span
                className="text-base font-bold"
                style={{ color: C.oxford, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
              >
                {activeLabel}
              </span>
            </div>
          </div>

          {/* Right: badge + user */}
          <div className="flex items-center gap-3">
            <span
              className="hidden sm:inline-flex badge text-white text-[10px]"
              style={{ background: C.pumpkin }}
            >
              {user?.role ?? 'ADMIN'}
            </span>

            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2.5 pl-3 px-2 py-1.5 rounded-xl transition-all text-left hover:bg-slate-50"
              style={{ borderLeft: '1px solid #EAECEF' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${C.pumpkin} 0%, ${C.oxford} 100%)`,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold leading-tight" style={{ color: C.oxford, fontFamily: 'var(--font-display)' }}>
                  {user?.nombre || user?.email?.split('@')[0]}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {user?.empresa?.nombre || 'Sin empresa'}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Modales ───────────────────────────────────────────────────────── */}
      {showProfileModal && (
        <Modal title="Mi Perfil" onClose={() => setShowProfileModal(false)}>
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4"
              style={{
                background: `linear-gradient(135deg, ${C.pumpkin}, ${C.oxford})`,
                fontFamily: 'var(--font-display)',
              }}
            >
              {user?.email?.charAt(0)?.toUpperCase()}
            </div>
            <h4
              className="text-lg font-bold"
              style={{ color: C.oxford, fontFamily: 'var(--font-display)' }}
            >
              {user?.nombre || user?.firstName || 'Usuario'}
            </h4>
            <span className="badge mt-2 text-white text-[10px]" style={{ background: C.pumpkin }}>
              {user?.role}
            </span>
          </div>

          <div className="space-y-3">
            <div
              className="p-4 rounded-xl flex items-start gap-3"
              style={{ background: '#F7F8FA', border: '1px solid #EAECEF' }}
            >
              <Mail className="text-slate-400 shrink-0 mt-0.5" size={16} />
              <div>
                <p
                  className="text-[10px] font-bold uppercase mb-0.5"
                  style={{ color: '#6b7280', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}
                >
                  Correo
                </p>
                <p className="text-sm font-medium" style={{ color: C.oxford }}>{user?.email}</p>
              </div>
            </div>
            <div
              className="p-4 rounded-xl flex items-start gap-3"
              style={{ background: '#F7F8FA', border: '1px solid #EAECEF' }}
            >
              <Briefcase className="text-slate-400 shrink-0 mt-0.5" size={16} />
              <div>
                <p
                  className="text-[10px] font-bold uppercase mb-0.5"
                  style={{ color: '#6b7280', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}
                >
                  Empresa
                </p>
                <p className="text-sm font-medium" style={{ color: C.oxford }}>
                  {user?.empresa?.nombre || 'No asignada'}
                </p>
                <p className="text-xs text-slate-400">{user?.empresa?.rif || ''}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 flex justify-center gap-3" style={{ borderTop: '1px solid #EAECEF' }}>
            <Link 
              to="/mi-perfil" 
              className="btn-primary"
              onClick={() => setShowProfileModal(false)}
            >
              Editar Perfil
            </Link>
          </div>
        </Modal>
      )}

      {confirmLogout && (
        <ConfirmDialog
          title="Cerrar sesión"
          msg="¿Seguro que deseas salir del sistema?"
          type="danger"
          onConfirm={onLogout}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </div>
  );
}
