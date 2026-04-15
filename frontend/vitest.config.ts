/* ============================================
   StartupEvents — Vitest Configuration
   Syllabus: FE Unit VI — Testing configuration
   ============================================ */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for DOM-related tests
    environment: 'node',

    // Test file patterns
    include: ['src/__tests__/**/*.test.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/ts/**/*.ts'],
      exclude: ['src/ts/types/**'],
    },

    // Timeout per test
    testTimeout: 10000,
  },
});
