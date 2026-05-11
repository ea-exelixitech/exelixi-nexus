import React, { useState, useEffect } from 'react';
import { Check, Copy, X, AlertTriangle } from 'lucide-react';

export function Spinner({ size = 16 }: { size?: number }) {
  return <div style={{ width: size, height: size }} className="border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />;
}

export function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600'}`}>
      {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
    </button>
  );
}

export const BADGE: Record<string, string> = {
  ACTIVE: 'badge badge-green', TRIAL: 'badge badge-blue', SUSPENDED: 'badge badge-red',
  INACTIVE: 'badge badge-gray', BETA: 'badge badge-amber', DEPRECATED: 'badge badge-gray',
  REVOKED: 'badge badge-red', SUPERADMIN: 'badge badge-violet', ADMIN: 'badge badge-blue', CLIENT: 'badge badge-gray',
};

export function Modal({ title, onClose, children, size = '' }: { title: string; onClose: () => void; children: React.ReactNode; size?: string }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={size === 'lg' ? 'modal-box-lg' : 'modal-box'}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="btn-icon bg-slate-50 hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ msg, type, onDismiss }: { msg: string; type: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl text-sm font-medium max-w-sm ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
      style={{ animation: 'slideUp 0.2s ease' }}>
      {type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
      <span>{msg}</span>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
    </div>
  );
}

export function StatCard({ label, value, icon, color, sub, onClick }: { label: string; value: number | string; icon: string; color: string; sub?: string; onClick?: () => void }) {
  const colors: Record<string, string> = {
    violet: 'bg-orange-50 text-orange-500',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className={`stat-card ${onClick ? 'transition-all duration-200 hover:shadow-md hover:border-orange-200 cursor-pointer' : ''}`} onClick={onClick}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{value ?? 0}</p>
        <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title = "Confirmar acción", msg, onConfirm, onCancel, type = 'primary' }: { title?: string; msg: string; onConfirm: () => void; onCancel: () => void; type?: 'primary' | 'danger' }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-slate-600 text-[15px] mb-6">{msg}</p>
      <div className="flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>Cancelar</button>
        <button type="button" className={`flex-1 ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onCancel(); }}>Sí, continuar</button>
      </div>
    </Modal>
  );
}
