import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api requests to the Spring Boot backend during development.
      // This avoids browser CORS preflight issues and prevents credentials from
      // being exposed in client-side code. The browser sends requests to the
      // Vite dev server on localhost:5173, which forwards them to localhost:8080.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/actuator': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
