import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5200,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://localhost:3091', changeOrigin: true },
    },
  },
});
