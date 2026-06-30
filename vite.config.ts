import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { prefixDevProxy, resolveAppBase } from './vite-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = resolveAppBase(env);
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:3092';

  const proxy = prefixDevProxy(base, {
    '/api': { target: apiTarget, changeOrigin: true },
  });

  return {
    base,
    plugins: [react()],
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
