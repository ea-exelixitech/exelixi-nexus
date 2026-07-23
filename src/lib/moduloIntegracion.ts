/** URL base de Nexus API (misma que usa el admin vía proxy). */
export function nexusApiUrlFromEnv(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const base = raw?.trim() || 'http://localhost:3092';
  return base.replace(/\/$/, '');
}

export type SubmoduloIntegracion = {
  id: number;
  nombre: string;
  url: string | null;
};

export function buildFrontendEnv(sub: SubmoduloIntegracion): string {
  const nexus = nexusApiUrlFromEnv();
  return [
    '# Frontend del módulo (Vite / SvelteKit)',
    `VITE_NEXUS_API_URL=${nexus}`,
    `# Submódulo Nexus ID: ${sub.id} (${sub.nombre})`,
    sub.url ? `# URL pública registrada: ${sub.url}` : '# Definir URL pública del submódulo en Admin',
    '',
    '# Copiar kit: exelixi-nexus-services/sdk/nexus-guard/svelte/ → src/lib/nexus/',
  ].join('\n');
}

export function buildBackendEnv(sub: SubmoduloIntegracion): string {
  const nexus = nexusApiUrlFromEnv();
  return [
    '# Backend Express del módulo',
    `NEXUS_API_URL=${nexus}`,
    'TENANT_TOKEN_SECRET=<solicitar al equipo Nexus — mismo valor que nexus-api>',
    `NEXUS_EXPECTED_SUBMODULO_IDS=${sub.id}`,
    'NEXUS_AUTH_ENABLED=true',
    '# Solo desarrollo local (no usar en producción):',
    '# WHITELISTED_ORIGINS=localhost,127.0.0.1',
    '',
    '# Middleware: sdk/nexus-guard/svelte/backend/nexus-middleware.ts → src/middleware/nexusAuth.ts',
  ].join('\n');
}

export function buildHandoffResumen(moduloNombre: string, sub: SubmoduloIntegracion): string {
  const nexus = nexusApiUrlFromEnv();
  return [
    `Módulo Admin: ${moduloNombre}`,
    `Submódulo: ${sub.nombre} (id ${sub.id})`,
    `Nexus API: ${nexus}`,
    sub.url ? `URL acceso: ${sub.url}` : 'URL acceso: pendiente en Admin',
    '',
    'Pasos: 1) Copiar kit SDK  2) Pegar .env  3) Empresas → activar  4) Probar enlace con nexus_token',
  ].join('\n');
}

export const SEGURIDAD_INTEGRACION: readonly string[] = [
  'NEXUS_EXPECTED_SUBMODULO_IDS debe coincidir con el id del submódulo (no compartir tokens entre apps).',
  'TENANT_TOKEN_SECRET solo por canal seguro; nunca en el repositorio del módulo.',
  'En producción: NEXUS_AUTH_ENABLED=true y sin WHITELISTED_ORIGINS salvo QA acotado.',
  'Activar el submódulo por empresa en Admin antes de entregar API Key o enlaces.',
  'API Key (Conexiones): solo para apps standalone; rotar si se filtra.',
];

export const PASOS_RAPIDOS: readonly string[] = [
  'Módulos → crear módulo + submódulo con URL HTTPS pública.',
  'Integración → copiar .env front/back y entregar carpeta sdk/nexus-guard/svelte/.',
  'Empresas → activar módulo y submódulo por cliente.',
  'Panel / SSO → abrir con ?nexus_token= o flujo API Key documentado.',
];
