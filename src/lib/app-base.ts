/** Prefijo público HTTPS del admin (Apache `/admin/` → vite en :5200/). */
const PROD_PUBLIC_PREFIX = '/admin';

/** Base relativa Vite (`./`) usada con Apache strip en cierrelmds. */
function isApacheRelativeBase(base: string): boolean {
  return base === './' || base === '.';
}

/**
 * QA / acceso directo IP:puerto (sin prefijo `/admin/`).
 * - `VITE_APP_BASE=/` → rutas en `/`
 * - `VITE_DIRECT_ACCESS=1` → fuerza modo directo aunque base sea `./`
 */
function isDirectDeploy(): boolean {
  const flag = import.meta.env.VITE_DIRECT_ACCESS;
  if (flag === '1' || flag === 'true') return true;
  const base = import.meta.env.BASE_URL ?? '/';
  return base === '/' || base === '';
}

function normalizedBase(): string {
  if (isDirectDeploy()) return '/';
  const base = import.meta.env.BASE_URL ?? '/';
  if (isApacheRelativeBase(base)) {
    return import.meta.env.PROD ? `${PROD_PUBLIC_PREFIX}/` : '/';
  }
  return base.replace(/\/?$/, '/');
}

/** Base URL del admin (Vite `base`). Ej. `/admin/` → API en `/admin/api`. */
export function moduleApiBase(): string {
  return `${normalizedBase()}api`;
}

/** basename para react-router (sin barra final). Nunca `./` ni `/.`. */
export function routerBasename(): string {
  if (isDirectDeploy()) return '';

  const base = import.meta.env.BASE_URL ?? '/';
  if (isApacheRelativeBase(base)) {
    return import.meta.env.PROD ? PROD_PUBLIC_PREFIX : '';
  }
  if (base === '/') return '';

  const trimmed = base.replace(/\/$/, '');
  // BASE_URL mal formado (p. ej. `/.`) — evita Router basename="/. "
  if (trimmed === '/.' || trimmed === '.' || trimmed === './') return '';

  return trimmed;
}

/** Archivo en `public/` respetando prefijo (ej. `/admin/logo-dark-bg.png`). */
export function publicAsset(path: string): string {
  const clean = path.replace(/^\//, '');
  return `${normalizedBase()}${clean}`;
}
