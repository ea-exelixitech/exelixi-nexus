/** Utilidades compartidas: base path HTTPS (cierrelmds) en vite.config. */

/**
 * Base de Vite en build.
 *
 * - Dev: `/`
 * - Prod cierrelmds (Apache strip `/admin/` → :5200/`): `./` → assets en `/admin/assets/…`
 * - Prod subpath explícito (`/ocr/`, `/admin/` sin strip): `VITE_APP_BASE=/ocr/` etc.
 */
export function resolveAppBase(
  env: Record<string, string>,
  mode: string = 'development',
): string {
  const raw = env.VITE_APP_BASE?.trim();
  if (raw === './' || raw === '.') return './';
  // Nexus admin en cierrelmds: Apache hace strip /admin/ → :5200/ (no usar base /admin/ en Vite)
  if (raw === '/admin/' || raw === '/admin') return './';
  if (raw && raw !== '/') {
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
  if (mode === 'production') return './';
  return '/';
}

/** Prefija rutas de proxy cuando la app se sirve bajo un subpath absoluto. */
export function prefixDevProxy(
  base: string,
  routes: Record<string, { target: string; changeOrigin?: boolean }>,
): Record<
  string,
  { target: string; changeOrigin?: boolean; rewrite?: (path: string) => string }
> {
  if (base === '/' || base === './') return routes;

  const root = base.replace(/\/$/, '');
  const out: Record<
    string,
    { target: string; changeOrigin?: boolean; rewrite?: (path: string) => string }
  > = {};

  for (const [path, cfg] of Object.entries(routes)) {
    out[`${root}${path}`] = {
      ...cfg,
      rewrite: (p: string) => p.slice(root.length) || '/',
    };
  }

  return out;
}
