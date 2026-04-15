/* ============================================
   StartupEvents — Theme Toggle (Dark/Light)
   Syllabus: FE Unit II — localStorage, event handling
   ============================================ */

// IIFE to avoid polluting global scope
(function () {
  'use strict';

  const THEME_KEY = 'startupevents-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  /**
   * Get the saved theme from localStorage, or default to dark
   * Demonstrates: localStorage, ternary operator
   * @returns {'dark' | 'light'}
   */
  const getSavedTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === LIGHT ? LIGHT : DARK;
  };

  /**
   * Apply theme to the document
   * Demonstrates: DOM manipulation (setAttribute), conditional logic
   * @param {'dark' | 'light'} theme
   */
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = theme === DARK ? '🌙' : '☀️';
      toggleBtn.setAttribute('aria-label', `Switch to ${theme === DARK ? 'light' : 'dark'} mode`);
    }
  };

  /**
   * Toggle between dark and light themes
   * Demonstrates: localStorage.setItem, ternary, event handling
   */
  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === DARK ? LIGHT : DARK;
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  // Initialize theme on page load
  applyTheme(getSavedTheme());

  // Attach event listener - demonstrates addEventListener
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
})();
