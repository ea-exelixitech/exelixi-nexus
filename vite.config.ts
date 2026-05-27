import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 5200,
      host: true,
      allowedHosts: true,
      proxy: {
        '/api': { 
          target: env.VITE_API_URL || 'http://localhost:3091', 
          changeOrigin: true 
        },
      },
    },
    preview: {
      port: 5200,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://127.0.0.1:3092',
          changeOrigin: true,
        },
      },
    },
  };
});
