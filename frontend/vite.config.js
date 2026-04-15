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
  // Root directory for source files
  root: 'src',

  // Public base path (for deployment)
  base: '/',

  // Dev server config
  server: {
    port: 3000,
    open: '/pages/index.html', // Auto-open in browser
    proxy: {
      // Proxy API requests to the Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy Socket.IO
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },

  // Build configuration
  build: {
    outDir: '../dist',  // Output directory
    emptyOutDir: true,

    // Multi-page app — specify all HTML entry points
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/index.html'),
        events: resolve(__dirname, 'src/pages/events.html'),
        eventDetail: resolve(__dirname, 'src/pages/event-detail.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
      },
    },

    // Chunk splitting for better caching
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/index.html'),
        events: resolve(__dirname, 'src/pages/events.html'),
        eventDetail: resolve(__dirname, 'src/pages/event-detail.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
      },
    },
  },

  // Path aliases
  resolve: {
    alias: {
      '@css': resolve(__dirname, 'src/css'),
      '@js': resolve(__dirname, 'src/js'),
      '@pages': resolve(__dirname, 'src/pages'),
    },
  },
});
