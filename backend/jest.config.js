/* ============================================
   StartupEvents — Jest Configuration
   Syllabus: BE Unit VI — Testing configuration
   ============================================ */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetModules: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/__tests__/**',
    '!src/scripts/**',
    '!src/demos/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60,
    },
  },
  setupFiles: ['dotenv/config'],
};
