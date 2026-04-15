/* ============================================
   StartupEvents — Event Filtering & Sorting
   Syllabus: FE Unit II — Arrays (.filter, .sort, .map),
             objects, control flow, event handling
   ============================================ */

(function () {
  'use strict';

  /**
   * Get all event cards from the DOM
   * Demonstrates: querySelectorAll, Array.from, spread operator
   * @returns {HTMLElement[]}
   */
  const getEventCards = () => [...document.querySelectorAll('#events-grid .card')];

  /**
   * Get card data from DOM attributes
   * Demonstrates: object creation, destructuring, data attributes
   * @param {HTMLElement} card
   * @returns {{ element: HTMLElement, category: string, date: string, city: string, title: string }}
   */
  const getCardData = (card) => ({
    element: card,
    category: card.dataset.category || '',
    date: card.dataset.date || '',
    city: card.dataset.city || '',
    title: card.querySelector('.card__title')?.textContent?.toLowerCase() || '',
    tags: [...card.querySelectorAll('.tag')].map((t) => t.textContent.toLowerCase()),
  });

  /**
   * Filter cards by category
   * Demonstrates: Array.filter(), strict equality
   * @param {Array} cards - Array of card data objects
   * @param {string} category - Category to filter by
   * @returns {Array}
   */
  const filterByCategory = (cards, category) => {
    if (!category) return cards;
    return cards.filter((card) => card.category === category);
  };

  /**
   * Filter cards by search query (title, city, tags)
   * Demonstrates: Array.filter(), String.includes(), Array.some()
   * @param {Array} cards
   * @param {string} query
   * @returns {Array}
   */
  const filterBySearch = (cards, query) => {
    if (!query) return cards;
    const q = query.toLowerCase();
    return cards.filter((card) =>
      card.title.includes(q) ||
      card.city.includes(q) ||
      card.tags.some((tag) => tag.includes(q))
    );
  };

  /**
   * Sort cards based on sort option
   * Demonstrates: Array.sort(), switch statement, Date comparison
   * @param {Array} cards
   * @param {string} sortBy
   * @returns {Array}
   */
  const sortCards = (cards, sortBy) => {
    // Create a shallow copy to avoid mutating the original array
    const sorted = [...cards];

    switch (sortBy) {
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
        // For demo, reverse order to simulate popularity
        sorted.reverse();
        break;
      default:
        break;
    }

    return sorted;
  };

  /**
   * Apply filters and re-render the grid
   * Demonstrates: DOM manipulation, chaining array methods
   */
  const applyFilters = () => {
    const categorySelect = document.getElementById('filter-category');
    const sortSelect = document.getElementById('filter-sort');
    const searchInput = document.getElementById('search-input');
    const eventsGrid = document.getElementById('events-grid');
    const emptyState = document.getElementById('empty-state');
    const loadMoreContainer = document.getElementById('load-more-container');

    if (!eventsGrid) return;

    const category = categorySelect?.value || '';
    const sortBy = sortSelect?.value || 'date-asc';
    const searchQuery = searchInput?.value || '';

    // Get all card data
    const allCards = getEventCards().map(getCardData);

    // Apply filters in sequence using pipe-like pattern
    let filtered = filterByCategory(allCards, category);
    filtered = filterBySearch(filtered, searchQuery);
    filtered = sortCards(filtered, sortBy);

    // Show/hide cards based on filter results
    const filteredElements = new Set(filtered.map((c) => c.element));

    allCards.forEach(({ element }) => {
      if (filteredElements.has(element)) {
        element.style.display = '';
        element.style.animation = 'fadeInUp 0.3s ease both';
      } else {
        element.style.display = 'none';
      }
    });

    // Reorder cards in the DOM
    filtered.forEach(({ element }) => {
      eventsGrid.appendChild(element);
    });

    // Show/hide empty state
    if (emptyState) {
      emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
    }
    if (loadMoreContainer) {
      loadMoreContainer.style.display = filtered.length === 0 ? 'none' : '';
    }

    // Update active filters display
    updateActiveFilters(category, searchQuery);
  };

  /**
   * Update the active filters display
   * Demonstrates: createElement, appendChild, template literals
   * @param {string} category
   * @param {string} search
   */
  const updateActiveFilters = (category, search) => {
    const container = document.getElementById('active-filters');
    if (!container) return;

    container.innerHTML = ''; // Clear existing

    if (category) {
      const categoryNames = {
        hackathon: '🏆 Hackathon',
        'pitch-night': '🎤 Pitch Night',
        workshop: '🛠️ Workshop',
        meetup: '☕ Meetup',
        conference: '🎪 Conference',
      };

      const tag = document.createElement('span');
      tag.className = 'tag tag--removable';
      tag.innerHTML = `${categoryNames[category] || category} <button onclick="document.getElementById('filter-category').value=''; document.getElementById('filter-category').dispatchEvent(new Event('change'));" style="cursor:pointer; background:none; border:none; color:inherit; margin-left:4px;">✕</button>`;
      container.appendChild(tag);
    }

    if (search) {
      const tag = document.createElement('span');
      tag.className = 'tag tag--removable';
      tag.innerHTML = `Search: "${search}" <button onclick="document.getElementById('search-input').value=''; document.getElementById('search-input').dispatchEvent(new Event('input'));" style="cursor:pointer; background:none; border:none; color:inherit; margin-left:4px;">✕</button>`;
      container.appendChild(tag);
    }
  };

  // ============ Event Listeners ============

  const init = () => {
    const categorySelect = document.getElementById('filter-category');
    const sortSelect = document.getElementById('filter-sort');
    const clearBtn = document.getElementById('clear-filters-btn');

    // Filter/sort change events
    if (categorySelect) {
      categorySelect.addEventListener('change', applyFilters);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilters);
    }

    // Clear all filters button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (categorySelect) categorySelect.value = '';
        if (sortSelect) sortSelect.value = 'date-asc';
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        applyFilters();
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose applyFilters globally so search.js can use it
  window.__applyFilters = applyFilters;
})();
