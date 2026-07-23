/** Utilidades compartidas: base path HTTPS (cierrelmds) en vite.config. */

/**
 * Base de Vite en build.
 *
 * - Dev: `/`
 * - Prod cierrelmds: `/admin/` (rutas absolutas a assets; evita 404 en `/admin/empresas/…`)
 * - Override: `VITE_APP_BASE=/otro/` si el admin vive en otro subpath
 */
export function resolveAppBase(
  env: Record<string, string>,
  mode: string = 'development',
): string {
  const raw = env.VITE_APP_BASE?.trim();
  if (raw === './' || raw === '.') {
    // Legacy relativo — rompe assets en rutas profundas del SPA; preferir /admin/
    return mode === 'production' ? '/admin/' : '/';
  }
  if (raw && raw !== '/') {
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
  if (mode === 'production') return '/admin/';
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
