/** Prefijo público HTTPS del admin (Apache `/admin/` → vite en :5200/). */
const PROD_PUBLIC_PREFIX = '/admin';

function normalizedBase(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === './' || base === '.') {
    return import.meta.env.PROD ? `${PROD_PUBLIC_PREFIX}/` : '/';
  }
  return base.replace(/\/?$/, '/');
}

/** Base URL del admin (Vite `base`). Ej. `/admin/` → API en `/admin/api`. */
export function moduleApiBase(): string {
  return `${normalizedBase()}api`;
}

/** basename para react-router (sin barra final). */
export function routerBasename(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === './' || base === '.') {
    return import.meta.env.PROD ? PROD_PUBLIC_PREFIX : '';
  }
  if (base === '/') return '';
  return base.replace(/\/$/, '');
}

/** Archivo en `public/` respetando prefijo (ej. `/admin/logo-dark-bg.png`). */
export function publicAsset(path: string): string {
  const clean = path.replace(/^\//, '');
  return `${normalizedBase()}${clean}`;
}
