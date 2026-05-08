import React, { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Key, Blocks, Zap, X, LogOut, Menu, User as UserIcon, Mail, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDialog, Modal } from './ui';

export default function Layout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || 'dashboard';

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'empresas', label: 'Empresas', icon: Building2, path: '/empresas' },
    { id: 'usuarios', label: 'Usuarios', icon: Users, path: '/usuarios' },
    { id: 'roles', label: 'Roles y Permisos', icon: Key, path: '/roles' },
    { id: 'modulos', label: 'Módulos', icon: Blocks, path: '/modulos' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar shadow-xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 relative">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-violet-500/30 shrink-0"><Zap size={20} /></div>
          {!isCollapsed && <div className="min-w-0 overflow-hidden"><p className="font-extrabold text-slate-900 leading-none truncate">ExelixiTech</p><p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 truncate">Admin Panel</p></div>}
          <button className="lg:hidden ml-auto btn-icon btn-ghost shrink-0" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-violet-600 hover:border-violet-200 shadow-sm z-50 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
          {!isCollapsed ? (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 truncate">Menú principal</p>
          ) : (
            <div className="h-8"></div>
          )}
          {NAV.map(item => (
            <Link key={item.id} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`nav-item ${currentPath === item.id ? 'nav-active' : 'nav-inactive'} ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}>
              <item.icon size={18} strokeWidth={1.7} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && currentPath === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={() => setConfirmLogout(true)} 
            className={`nav-item text-slate-600 hover:bg-red-50 hover:text-red-600 ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={isCollapsed ? "Salir" : undefined}
          >
            <LogOut size={18} strokeWidth={1.7} className="shrink-0" />
            {!isCollapsed && <span>Salir</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center gap-4">
          <button className="lg:hidden btn-icon btn-ghost" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="flex-1"><p className="font-bold text-slate-900 capitalize"></p></div>
          <div className="flex items-center gap-4">
            <span className={`badge ${user?.role?.toUpperCase() === 'SUPERADMIN' ? 'badge-violet' : 'badge-blue'}`}>{user?.role}</span>
            
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 p-1.5 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                {user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.nombre || user?.firstName || user?.email?.split('@')[0]}</p>
                <p className="text-xs text-slate-500 leading-tight mt-0.5">{user?.empresa?.nombre || 'Sin empresa'}</p>
              </div>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      {showProfileModal && (
        <Modal title="Perfil de Usuario" onClose={() => setShowProfileModal(false)}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4">
              {user?.email?.charAt(0)?.toUpperCase()}
            </div>
            <h4 className="text-lg font-bold text-slate-900">{user?.nombre || user?.firstName || 'Usuario'} {user?.apellido || user?.lastName || ''}</h4>
            <span className={`badge mt-2 ${user?.role?.toUpperCase() === 'SUPERADMIN' ? 'badge-violet' : 'badge-blue'}`}>{user?.role}</span>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
              <Mail className="text-slate-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Correo Electrónico</p>
                <p className="text-sm font-medium text-slate-900">{user?.email}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
              <Briefcase className="text-slate-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Empresa</p>
                <p className="text-sm font-medium text-slate-900">{user?.empresa?.nombre || 'No asignada'}</p>
                <p className="text-sm font-medium text-slate-400">{user?.empresa?.rif || ''}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {confirmLogout && (
        <ConfirmDialog 
          title="Cerrar sesión" 
          msg="¿Estás seguro que deseas cerrar sesión y salir del sistema?" 
          type="danger"
          onConfirm={onLogout} 
          onCancel={() => setConfirmLogout(false)} 
        />
      )}
    </div>
  );
}
