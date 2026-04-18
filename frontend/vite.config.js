/* ============================================
   StartupEvents — Vite Configuration
   Syllabus: FE Unit IV — Module bundling, HMR,
             production build, multi-page app
   ============================================ */

import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite config for multi-page application
 * 
 * Demonstrates: module bundling, dev server, HMR (Hot Module Replacement),
 *               multi-page app setup with rollupOptions.input,
 *               path aliases, build optimization
 */
export default defineConfig({
  root: 'src',

  base: '/',

  server: {
    port: 3000,
    open: '/pages/index.html',
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
      },
    },
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        events: resolve(__dirname, 'src/pages/events.html'),
        eventDetail: resolve(__dirname, 'src/pages/event-detail.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
      },
    },
  },

  resolve: {
    alias: {
      '@css': resolve(__dirname, 'src/css'),
      '@js': resolve(__dirname, 'src/js'),
      '@pages': resolve(__dirname, 'src/pages'),
    },
  },
});
