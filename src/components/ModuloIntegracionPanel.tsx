import React from 'react';
import { CopyBtn } from './ui';
import { Shield, AlertTriangle, FolderOpen } from 'lucide-react';
import {
  buildBackendEnv,
  buildFrontendEnv,
  buildHandoffResumen,
  SEGURIDAD_INTEGRACION,
  type SubmoduloIntegracion,
} from '../lib/moduloIntegracion';

type Props = {
  moduloNombre: string;
  submodulo: SubmoduloIntegracion;
};

export default function ModuloIntegracionPanel({ moduloNombre, submodulo }: Props) {
  const frontEnv = buildFrontendEnv(submodulo);
  const backEnv = buildBackendEnv(submodulo);
  const resumen = buildHandoffResumen(moduloNombre, submodulo);

  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900">
        <span className="font-bold">Submódulo ID</span>
        <code className="px-2 py-0.5 bg-white rounded font-mono text-base">{submodulo.id}</code>
        <CopyBtn text={String(submodulo.id)} />
        <span className="text-xs text-orange-700 ml-auto">Usar en NEXUS_EXPECTED_SUBMODULO_IDS</span>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="font-bold text-slate-800">Resumen para el equipo del módulo</h4>
          <CopyBtn text={resumen} />
        </div>
        <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">{resumen}</pre>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="font-bold text-slate-800">.env frontend</h4>
          <CopyBtn text={frontEnv} />
        </div>
        <pre className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl overflow-x-auto font-mono">{frontEnv}</pre>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="font-bold text-slate-800">.env backend</h4>
          <CopyBtn text={backEnv} />
        </div>
        <pre className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl overflow-x-auto font-mono">{backEnv}</pre>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <FolderOpen size={18} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-slate-600 text-xs leading-relaxed">
          Entregar carpeta completa{' '}
          <code className="bg-white px-1 rounded">exelixi-nexus-services/sdk/nexus-guard/svelte/</code>{' '}
          (incluye <code className="bg-white px-1 rounded">INTEGRACION.md</code>). Svelte: copiar a{' '}
          <code className="bg-white px-1 rounded">src/lib/nexus/</code> y envolver con{' '}
          <code className="bg-white px-1 rounded">NexusGuard</code>.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Shield size={16} className="text-emerald-600" />
          Seguridad
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-600">
          {SEGURIDAD_INTEGRACION.map((line) => (
            <li key={line} className="flex gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
