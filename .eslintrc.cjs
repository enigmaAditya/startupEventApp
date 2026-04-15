/* ============================================
   StartupEvents — ESLint Configuration
   Syllabus: FE Unit VI — Static analysis,
             code quality, linting rules
   ============================================ */

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // ---- Best Practices ----
    'no-var': 'error',               // Use let/const instead of var
    'prefer-const': 'warn',          // Use const when possible
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',            // Allow console in dev

    // ---- Style ----
    'semi': ['error', 'always'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'comma-dangle': ['warn', 'always-multiline'],
    'no-trailing-spaces': 'warn',
    'eol-last': ['warn', 'always'],

    // ---- ES6+ ----
    'arrow-spacing': 'warn',
    'no-duplicate-imports': 'error',
    'prefer-template': 'warn',       // Template literals over concatenation

    // ---- Error prevention ----
    'eqeqeq': ['error', 'always'],   // === instead of ==
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-throw-literal': 'error',
  },
  overrides: [
    {
      // TypeScript files
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '*.min.js'],
};
