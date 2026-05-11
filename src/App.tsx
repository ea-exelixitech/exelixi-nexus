import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authApi, companiesApi, modulesApi, usersApi, rolesApi, setToken, clearToken } from './api';
import Layout from './components/Layout';
import { Toast } from './components/ui';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/empresas/Empresas';
import Modulos from './pages/modulos/Modulos';
import ModuloCrear from './pages/modulos/ModuloCrear';
import Roles from './pages/roles/Roles';
import RolCrear from './pages/roles/RolCrear';
import Usuarios from './pages/usuarios/Usuarios';
import UsuarioCrear from './pages/usuarios/UsuarioCrear';
import MiPerfil from './pages/usuarios/MiPerfil.tsx';
import EmpresaDashboard from './pages/empresas/EmpresaDashboard';
import EmpresaCrear from './pages/empresas/EmpresaCrear';
import PanelControl from './pages/panel/PanelControl';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ empresas: 0, usuarios: 0, modulos: 0, roles: 0 });
  const [authChecked, setAuthChecked] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => setToastMsg({ msg, type });

  useEffect(() => {
    const saved = localStorage.getItem('exelitech_token');
    if (saved) {
      setToken(saved);
      authApi.me()
        .then(r => {
          // Extrae el usuario, la empresa y permisos fusionándolos en un solo objeto
          const meData = r.data?.data || r.data;
          const u = meData.user ? { ...meData.user, empresa: meData.empresa, permissions: meData.permissions } : meData;
          setUser(u);
        })
        .catch(() => {
          localStorage.removeItem('exelitech_token');
        })
        .finally(() => setAuthChecked(true));
    } else { 
      setAuthChecked(true); 
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      companiesApi.listar().catch(() => ({ data: [] })),
      usersApi.listar().catch(() => ({ data: [] })),
      modulesApi.listarTodos().catch(() => ({ data: [] })),
      rolesApi.listar().catch(() => ({ data: [] }))
    ])
      .then(([c, u, m, r]) => {
        const getLen = (res: any) => {
          const arr = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : (res?.data?.users || res?.data?.data?.items || res?.data?.items || []);
          return arr.length || 0;
        };
        setStats({ 
          empresas: getLen(c), 
          usuarios: getLen(u), 
          modulos: getLen(m), 
          roles: getLen(r) 
        });
      })
      .catch(() => {});
  }, [user]);

  if (!authChecked) return null;

  const handleLogout = () => { clearToken(); setUser(null); };

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={(u, t) => { setToken(t); setUser(u); }} />} />
        
        <Route element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard stats={stats} user={user} />} />
          <Route path="/panel" element={<PanelControl toast={showToast} />} />
          <Route path="/empresas" element={<Empresas toast={showToast} />} />
          <Route path="/empresas/nueva" element={<EmpresaCrear toast={showToast} />} />
          <Route path="/empresas/:id" element={<EmpresaDashboard toast={showToast} />} />
          <Route path="/modulos" element={<Modulos toast={showToast} />} />
          <Route path="/modulos/nuevo" element={<ModuloCrear toast={showToast} />} />
          <Route path="/roles" element={<Roles toast={showToast} />} />
          <Route path="/roles/nuevo" element={<RolCrear toast={showToast} />} />
          <Route path="/usuarios" element={<Usuarios toast={showToast} user={user} />} />
          <Route path="/usuarios/nuevo" element={<UsuarioCrear toast={showToast} />} />
          <Route path="/mi-perfil" element={<MiPerfil toast={showToast} user={user} setUser={setUser} />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>

      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onDismiss={() => setToastMsg(null)} />}
    </>
  );
}
