/* ============================================
   StartupEvents — Event Delegation Handler
   Syllabus: FE Unit IV — Event propagation,
             delegation, bubbling, capturing
   ============================================ */

(function () {
  'use strict';

  /**
   * Event Delegation Pattern
   * 
   * Instead of attaching listeners to each card individually,
   * we attach a SINGLE listener to the parent container.
   * When a click happens on a child, it "bubbles up" to the parent
   * where we determine which child was clicked using closest().
   *
   * Benefits:
   * 1. Works for dynamically added elements (no re-binding needed)
   * 2. Uses less memory (1 listener vs N listeners)
   * 3. Better performance for large lists
   *
   * Demonstrates: event bubbling, event.target, closest(),
   *               dataset attributes, stopPropagation
   */

  const initEventDelegation = () => {
    const eventsGrid = document.getElementById('events-grid');

    if (!eventsGrid) return;

    // ---- Single delegated click handler ----
    eventsGrid.addEventListener('click', (event) => {
      // Determine what type of element was clicked using closest()
      // closest() traverses up the DOM tree to find a matching ancestor

      // 1. Check if a button was clicked
      const button = event.target.closest('.btn');
      if (button) {
        handleButtonClick(button, event);
        return;
      }

      // 2. Check if a tag was clicked (for filtering)
      const tag = event.target.closest('.tag');
      if (tag) {
        handleTagClick(tag, event);
        return;
      }

      // 3. Check if a card was clicked (for quick preview)
      const card = event.target.closest('.card');
      if (card) {
        handleCardClick(card, event);
      }
    });

    // ---- Delegated hover effect for cards ----
    // Demonstrates: mouseover/mouseout bubbling
    eventsGrid.addEventListener('mouseover', (event) => {
      const card = event.target.closest('.card');
      if (card) {
        card.style.transform = 'translateY(-4px)';
      }
    });

    eventsGrid.addEventListener('mouseout', (event) => {
      const card = event.target.closest('.card');
      if (card) {
        card.style.transform = '';
      }
    });
  };

  /**
   * Handle button clicks within event cards
   * Demonstrates: dataset, conditional logic, event handling
   *
   * @param {HTMLElement} button
   * @param {Event} event
   */
  const handleButtonClick = (button, event) => {
    event.stopPropagation(); // Prevent card click from firing

    const card = button.closest('.card');
    const eventId = card?.dataset.eventId;

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = user && user.role === 'admin';

    // Check button type based on text or class
    if (button.textContent.includes('View Details') || button.textContent.includes('MODERATE')) {
      // For Admin, hijack the click to open the modal
      if (isAdmin && typeof window.__eventDetailModal === 'function' && card) {
        const eventData = {
          _id: eventId,
          title: card.querySelector('.card__title')?.textContent || '',
          description: card.querySelector('.card__description')?.textContent || '',
          category: card.dataset.category,
          date: card.dataset.date,
          location: { city: card.dataset.city },
          organizer: card.dataset.organizerId,
        };
        window.__eventDetailModal(eventData);
        return;
      }
      
      // For Attendee, navigate to event detail
      if (eventId) {
        window.location.href = `/event-detail?id=${eventId}`;
      }
    } else if (button.textContent.includes('RSVP')) {
      // Show RSVP modal or navigate
      if (typeof window.__eventDetailModal === 'function' && card) {
        const eventData = {
          _id: eventId,
          title: card.querySelector('.card__title')?.textContent || '',
          description: card.querySelector('.card__description')?.textContent || '',
          category: card.dataset.category,
          date: card.dataset.date,
          location: { city: card.dataset.city },
          organizer: card.dataset.organizerId,
        };
        window.__eventDetailModal(eventData);
      }
    }
  };

  /**
   * Handle tag clicks — apply filter
   * @param {HTMLElement} tag
   * @param {Event} event
   */
  const handleTagClick = (tag, event) => {
    event.stopPropagation();

    const tagText = tag.textContent.trim().toLowerCase();

    // Set the search input to the tag value and trigger filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = tagText;
      if (typeof window.__applyFilters === 'function') {
        window.__applyFilters();
      }
    }

    // Emit event on the event bus
    if (window.__eventBus) {
      window.__eventBus.emit('filter:changed', { search: tagText });
    }
  };

  /**
   * Handle card body clicks — quick preview modal
   * @param {HTMLElement} card
   * @param {Event} event
   */
  const handleCardClick = (card, event) => {
    // Don't trigger if a link or button was clicked
    if (event.target.closest('a, button')) return;

    const eventId = card.dataset.eventId;

    if (typeof window.__eventDetailModal === 'function') {
      const eventData = {
        _id: eventId,
        title: card.querySelector('.card__title')?.textContent || '',
        description: card.querySelector('.card__description')?.textContent || '',
        category: card.dataset.category,
        date: card.dataset.date,
        location: { city: card.dataset.city },
        organizer: card.dataset.organizerId,
      };
      window.__eventDetailModal(eventData);
    }
  };

  // ---- Initialize ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventDelegation);
  } else {
    initEventDelegation();
  }
})();
