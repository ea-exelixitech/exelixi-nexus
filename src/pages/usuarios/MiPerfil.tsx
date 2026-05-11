import React, { useState } from 'react';
import { usersApi } from '../../api';
import { Spinner, ConfirmDialog } from '../../components/ui';
import { Save, Lock, User as UserIcon, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

const formatNombre = (value: string) => {
  return value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]/g, '').substring(0, 50);
};

export default function MiPerfil({ toast, user, setUser }: { toast: (m: string, t: 'success' | 'error') => void, user: any, setUser: (u: any) => void }) {
  // Estado para la información del perfil
  const [perfilForm, setPerfilForm] = useState({
    nombre: user?.nombre || user?.firstName || ''
  });
  const [savingPerfil, setSavingPerfil] = useState(false);

  // Estado para el cambio de contraseña
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPwd, setSavingPwd] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [confirmData, setConfirmData] = useState<{ title?: string; msg: string; type?: 'primary' | 'danger'; action: () => void } | null>(null);

  // Reglas de validación de contraseña
  const pwdRules = {
    length: pwdForm.newPassword.length >= 6,
    uppercase: /[A-Z]/.test(pwdForm.newPassword),
    number: /[0-9]/.test(pwdForm.newPassword),
    special: /[^A-Za-z0-9]/.test(pwdForm.newPassword)
  };
  const isPwdValid = Object.values(pwdRules).every(Boolean);

  const handlePerfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmData({
      title: 'Actualizar Perfil',
      msg: '¿Estás seguro que deseas actualizar tus datos personales?',
      action: async () => {
        setSavingPerfil(true);
        try {
          const res = await usersApi.actualizar(user.id.toString(), perfilForm);
          toast(res.data?.message || 'Perfil actualizado con éxito', 'success');
          // Actualizar el estado global del usuario para que se refleje en el navbar
          setUser({ ...user, ...perfilForm });
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al actualizar perfil', 'error');
        } finally {
          setSavingPerfil(false);
        }
      }
    });
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPwdValid) {
      toast('La nueva contraseña no cumple con los requisitos mínimos.', 'error');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast('Las contraseñas nuevas no coinciden', 'error');
      return;
    }

    setConfirmData({
      title: 'Cambiar Contraseña',
      msg: '¿Estás seguro que deseas actualizar tu contraseña de acceso?',
      action: async () => {
        setSavingPwd(true);
        try {
          const res = await usersApi.cambiarPassword({ 
            currentPassword: pwdForm.currentPassword, 
            newPassword: pwdForm.newPassword 
          });
          toast(res.data?.message || 'Contraseña actualizada con éxito', 'success');
          setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
          toast(err.response?.data?.message || err.message || 'Error al cambiar contraseña', 'error');
        } finally {
          setSavingPwd(false);
        }
      }
    });
  };

  return (
    <div className="page-enter max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-slate-900">Mi Perfil</h2>
        <p className="text-slate-500 mt-1 italic">Gestiona tu información personal y actualiza tu contraseña de acceso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Información Personal */}
        <div className="card p-6 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Datos Personales</h2>
              <p className="text-xs text-slate-500 italic">Actualiza tu información básica.</p>
            </div>
          </div>

          <form onSubmit={handlePerfilSubmit} className="space-y-4">
            <div>
              <label className="label">Correo Electrónico</label>
              <input 
                type="email" 
                className="input bg-slate-50 text-slate-500 cursor-not-allowed" 
                value={user?.email || ''} 
                disabled 
              />
            </div>
            
            <div>
              <label className="label">Nombre *</label>
              <input 
                type="text" 
                className="input" 
                value={perfilForm.nombre} 
                onChange={e => setPerfilForm({...perfilForm, nombre: formatNombre(e.target.value)})} 
                maxLength={50}
                required 
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={savingPerfil}>
                {savingPerfil ? <Spinner size={16} /> : ''}
                {savingPerfil ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>

        {/* Tarjeta de Seguridad (Contraseña) */}
        <div className="card p-6 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Seguridad</h2>
              <p className="text-xs text-slate-500 italic">Actualiza tu contraseña de acceso.</p>
            </div>
          </div>

          <form onSubmit={handlePwdSubmit} className="space-y-4">
            <div>
              <label className="label">Contraseña Actual *</label>
              <div className="relative">
                <input 
                  type={showCurrentPwd ? "text" : "password"} 
                  className="input pr-10" 
                  value={pwdForm.currentPassword} 
                  onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} 
                  required 
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  title={showCurrentPwd ? "Ocultar" : "Mostrar"} 
                >
                  {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="label">Nueva Contraseña *</label>
              <div className="relative">
                <input 
                  type={showNewPwd ? "text" : "password"} 
                  className="input pr-10" 
                  value={pwdForm.newPassword} 
                  onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} 
                  required 
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  title={showNewPwd ? "Ocultar" : "Mostrar"} 
                >
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
            </div>

            <div>
              <label className="label">Confirmar Nueva Contraseña *</label>
              <div className="relative">
                <input 
                  type={showConfirmPwd ? "text" : "password"} 
                  className="input pr-10" 
                  value={pwdForm.confirmPassword} 
                  onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} 
                  required 
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  title={showConfirmPwd ? "Ocultar" : "Mostrar"} 
                >
                  {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Leyenda de Reglas de Contraseña */}
            <div className="mt-3 space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-2">La contraseña debe contener:</p>
              <div className={`flex items-center gap-2 text-xs ${pwdRules.length ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                {pwdRules.length ? <CheckCircle2 size={14} /> : <Circle size={14} className="opacity-40" />}
                <span>Mínimo 6 caracteres.</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${pwdRules.uppercase ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                {pwdRules.uppercase ? <CheckCircle2 size={14} /> : <Circle size={14} className="opacity-40" />}
                <span>Al menos una letra mayúscula.</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${pwdRules.number ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                {pwdRules.number ? <CheckCircle2 size={14} /> : <Circle size={14} className="opacity-40" />}
                <span>Al menos un número.</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${pwdRules.special ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                {pwdRules.special ? <CheckCircle2 size={14} /> : <Circle size={14} className="opacity-40" />}
                <span>Al menos un carácter especial</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                className="btn-primary bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 flex items-center gap-2" 
                disabled={savingPwd}
              >
                {savingPwd ? <Spinner size={16} /> : ''}
                {savingPwd ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
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
