function normalizedBase(): string {
  return (import.meta.env.BASE_URL ?? '/').replace(/\/?$/, '/');
}

/** Base URL del admin (Vite `base`). Ej. `/admin/` → API en `/admin/api`. */
export function moduleApiBase(): string {
  return `${normalizedBase()}api`;
}

/** basename para react-router (sin barra final). */
export function routerBasename(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/') return '';
  return base.replace(/\/$/, '');
}

/** Archivo en `public/` respetando prefijo (ej. `/admin/logo-dark-bg.png`). */
export function publicAsset(path: string): string {
  const clean = path.replace(/^\//, '');
  return `${normalizedBase()}${clean}`;
}
