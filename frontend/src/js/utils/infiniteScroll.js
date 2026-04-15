/* ============================================
   StartupEvents — Infinite Scroll
   Syllabus: FE Unit III — IntersectionObserver,
             async/await, Promises, event loop
   ============================================ */

(function () {
  'use strict';

  /**
   * Create an infinite scroll loader
   * 
   * Uses IntersectionObserver to detect when the user scrolls near the
   * bottom of the event list, then loads more events asynchronously.
   *
   * Demonstrates: IntersectionObserver, async/await, state management,
   *               Promise handling, DOM manipulation
   *
   * @param {Object} options
   * @param {string} options.sentinelId - ID of the sentinel element
   * @param {string} options.containerId - ID of the container to append items to
   * @param {Function} options.loadMore - Async function that returns { items, hasMore }
   * @param {Function} options.renderItem - Function that takes an item and returns HTMLElement
   */
  const createInfiniteScroll = ({
    sentinelId = 'scroll-sentinel',
    containerId = 'events-grid',
    loadMore,
    renderItem,
  }) => {
    // ---- State (closure) ----
    let page = 1;
    let isLoading = false;
    let hasMore = true;

    const sentinel = document.getElementById(sentinelId);
    const container = document.getElementById(containerId);

    if (!sentinel || !container) return null;

    /**
     * Show/hide loading indicator
     * @param {boolean} show
     */
    const toggleLoading = (show) => {
      const loader = document.getElementById('infinite-scroll-loader');
      if (loader) {
        loader.style.display = show ? 'flex' : 'none';
      }
    };

    /**
     * Load next page of items
     * Demonstrates: async/await, try/catch, state guards
     */
    const loadNextPage = async () => {
      // Guard: prevent concurrent loads or loading when done
      if (isLoading || !hasMore) return;

      isLoading = true;
      toggleLoading(true);

      try {
        // Call the provided async load function
        // This would typically call the API client
        const result = await loadMore(page + 1);

        // Append new items to the container
        if (result.items && result.items.length > 0) {
          // Use DocumentFragment for batch DOM insertion (performance)
          const fragment = document.createDocumentFragment();

          result.items.forEach((item) => {
            const element = renderItem(item);
            fragment.appendChild(element);
          });

          container.appendChild(fragment);
          page++;
        }

        // Update hasMore flag
        hasMore = result.hasMore !== false;

        if (!hasMore) {
          // Show "no more events" message
          const endMessage = document.getElementById('end-of-list');
          if (endMessage) endMessage.style.display = 'block';
          observer.unobserve(sentinel); // Stop observing
        }
      } catch (error) {
        console.error('Infinite scroll load error:', error);
        if (typeof window.showToast === 'function') {
          window.showToast({
            type: 'error',
            title: 'Load Error',
            message: 'Failed to load more events. Please try again.',
          });
        }
      } finally {
        isLoading = false;
        toggleLoading(false);
      }
    };

    // ---- IntersectionObserver ----
    // Fires when the sentinel element enters the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        // entries[0] is our sentinel
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      {
        root: null, // Use the viewport as root
        rootMargin: '200px', // Start loading 200px before sentinel is visible
        threshold: 0,
      }
    );

    // Start observing
    observer.observe(sentinel);

    // Return control interface
    return {
      /** Reset and reload from page 1 */
      reset: () => {
        page = 1;
        hasMore = true;
        isLoading = false;
        container.innerHTML = '';
        observer.observe(sentinel);
      },

      /** Get current state */
      getState: () => ({ page, isLoading, hasMore }),

      /** Stop infinite scroll */
      destroy: () => {
        observer.disconnect();
      },
    };
  };

  // Expose factory for pages that need it
  window.__createInfiniteScroll = createInfiniteScroll;
})();
