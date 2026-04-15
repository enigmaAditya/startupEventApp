/* ============================================
   StartupEvents — Search with Debounce
   Syllabus: FE Unit II — Functions, closures (preview),
             event handling, browser interaction
   ============================================ */

(function () {
  'use strict';

  /**
   * Create a debounced version of a function
   * Demonstrates: closures, setTimeout/clearTimeout, higher-order functions
   *
   * @param {Function} fn - The function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  const debounce = (fn, delay = 300) => {
    let timeoutId = null; // Closed over variable (closure)

    return (...args) => {
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a new timeout
      timeoutId = setTimeout(() => {
        fn(...args); // Spread operator to pass arguments
        timeoutId = null;
      }, delay);
    };
  };

  /**
   * Initialize search functionality
   */
  const init = () => {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Create debounced search handler
    // The debounce function returns a closure that "remembers" the timeout
    const debouncedSearch = debounce(() => {
      // Call the filter function from filters.js
      if (typeof window.__applyFilters === 'function') {
        window.__applyFilters();
      }
    }, 300);

    // Listen for input events (fires on every keystroke)
    searchInput.addEventListener('input', debouncedSearch);

    // Handle Enter key to search immediately
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (typeof window.__applyFilters === 'function') {
          window.__applyFilters();
        }
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
