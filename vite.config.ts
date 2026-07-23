import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  prefixDevProxy,
  PROD_ADMIN_PUBLIC_PREFIX,
  resolveAppBase,
} from './vite-paths';

/** Con Apache strip: assets relativos + base href = /admin/assets en rutas profundas. */
function adminPublicBaseHref(mode: string, base: string): Plugin {
  return {
    name: 'admin-public-base-href',
    transformIndexHtml(html) {
      if (mode !== 'production' || base !== './') return html;
      if (/<base\s/i.test(html)) return html;
      return html.replace(
        '<head>',
        `<head>\n    <base href="${PROD_ADMIN_PUBLIC_PREFIX}" />`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = resolveAppBase(env, mode);
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:3092';

  const proxy = prefixDevProxy(base, {
    '/api': { target: apiTarget, changeOrigin: true },
  });

  return {
    base,
    plugins: [react(), adminPublicBaseHref(mode, base)],
    server: {
      port: 5200,
      host: true,
      allowedHosts: true,
      proxy,
    },
    preview: {
      port: 5200,
      host: true,
      allowedHosts: true,
      proxy,
    },
  };
});
