/** Base URL del admin (Vite `base`). Ej. `/admin/` → API en `/admin/api`. */
export function moduleApiBase(): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/?$/, '/');
  return `${base}api`;
}

/** basename para react-router (sin barra final). */
export function routerBasename(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/') return '';
  return base.replace(/\/$/, '');
}
