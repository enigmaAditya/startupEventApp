import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Root is now the frontend directory itself
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        events: resolve(__dirname, 'events.html'),
        eventDetail: resolve(__dirname, 'event-detail.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        organizerDashboard: resolve(__dirname, 'organizer-dashboard.html'),
        manageEvent: resolve(__dirname, 'manage-event.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
