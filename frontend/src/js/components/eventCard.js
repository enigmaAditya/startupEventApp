/* ============================================
   StartupEvents — Dynamic Event Card Renderer
   Syllabus: FE Unit IV — DOM manipulation,
             createElement, appendChild, dynamic styling
   ============================================ */

(function () {
  'use strict';

  /**
   * Create an event card DOM element from data
   * Demonstrates: createElement, appendChild, template literals,
   *               classList, dataset, dynamic attribute setting
   *
   * @param {Object} event - Event data object
   * @returns {HTMLElement} Complete card element
   */
  const createEventCard = (event) => {
    // ---- Create card wrapper ----
    const card = document.createElement('article');
    card.className = 'card animate-in';
    card.dataset.category = event.category || '';
    card.dataset.date = event.date || '';
    card.dataset.city = event.location?.city || '';
    card.dataset.status = event.status || '';
    card.dataset.eventId = event._id || event.id || '';
    card.dataset.organizerId = event.organizer?._id || event.organizer || '';

    // Category emoji mapping
    const categoryConfig = {
      hackathon: { emoji: '🏆', color: 'var(--color-error)' },
      'pitch-night': { emoji: '🎤', color: 'var(--color-info)' },
      workshop: { emoji: '🛠️', color: 'var(--color-warning)' },
      meetup: { emoji: '☕', color: 'var(--color-success)' },
      conference: { emoji: '🎪', color: 'var(--brand-primary)' },
    };

    const config = categoryConfig[event.category] || { emoji: '📅', color: 'var(--brand-primary)' };

    // Format date
    const dateStr = event.date
      ? new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'TBD';

    // Format category name
    const categoryName = (event.category || 'event')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const statusConfig = {
      ongoing: { label: 'Live', color: 'var(--color-success)' },
      upcoming: { label: 'Upcoming', color: 'var(--color-info)' },
      completed: { label: 'Past', color: 'var(--text-tertiary)' },
      cancelled: { label: 'Cancelled', color: 'var(--color-error)' },
      'pending-approval': { label: 'Pending', color: 'var(--color-warning)' },
    };
    const status = statusConfig[event.status] || statusConfig.upcoming;

    // Role detection for UI enrichment
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = user && user.role === 'admin';

    // ---- Build inner HTML ----
    card.innerHTML = `
      <div class="card__image">
        ${config.emoji}
      </div>
      <div class="card__body">
        <div class="card__meta">
          <span class="tag" style="background: ${config.color}20; color: ${config.color}; border: 1px solid ${config.color}40; border-radius:4px;">${categoryName}</span>
          <span class="tag" style="background: ${status.color}18; color: ${status.color}; border: 1px solid ${status.color}30; border-radius:4px;">${status.label}</span>
          <span class="card__date">📅 ${dateStr}</span>
        </div>
        <h3 class="card__title">${escapeHTML(truncate(event.title || 'Untitled', 40))}</h3>
        <p class="card__description">${escapeHTML(truncate(event.description || '', 80))}</p>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <span style="font-size: var(--text-xs); color: var(--text-tertiary);">
            👥 ${(Array.isArray(event.attendees) ? event.attendees.length : (event.attendeeCount || 0))} RSVPs
          </span>
          ${(function() {
            const userId = user ? (user._id || user.id) : null;
            const isRegistered = (userId && event.attendees && event.attendees.some(a => (a._id || a) === userId));
            return isRegistered ? '<span class="badge badge--success" style="font-size: 0.6rem;">Registered</span>' : '';
          })()}
        </div>
      </div>
      <div class="card__footer">
        <span class="card__location" style="font-size: 0.75rem;">📍 ${escapeHTML(truncate(event.location?.city || 'Online', 15))}</span>
        <a href="/event-detail?id=${event._id || event.id || ''}" class="btn btn--sm btn--secondary">
          View Details →
        </a>
      </div>
    `;

    return card;
  };

  /**
   * Render an array of events into a grid container
   * Demonstrates: DocumentFragment for batch DOM insertion,
   *               Array.map, performance optimization
   *
   * @param {Array} events - Array of event objects
   * @param {string} containerId - Target container element ID
   * @param {boolean} append - If true, append to existing; if false, replace
   */
  const renderEventGrid = (events, containerId = 'events-grid', append = false) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Use DocumentFragment for batch DOM insertion (avoids reflows)
    const fragment = document.createDocumentFragment();

    events.forEach((event) => {
      const card = createEventCard(event);
      fragment.appendChild(card);
    });

    if (!append) {
      container.innerHTML = '';
    }

    container.appendChild(fragment);

    // Stagger animation for visual effect
    const cards = container.querySelectorAll('.card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.05}s`;
    });
  };

  /**
   * Render empty state when no events found
   * @param {string} containerId
   * @param {string} message
   */
  const renderEmptyState = (containerId = 'events-grid', message = 'No events found') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-12) var(--space-4);">
        <div style="font-size: 4rem; margin-bottom: var(--space-4);">🔍</div>
        <h3 style="color: var(--text-primary); margin-bottom: var(--space-2);">${message}</h3>
        <p style="color: var(--text-secondary);">Try adjusting your filters or search query</p>
      </div>
    `;
  };

  // ---- Helpers ----

  /**
   * Escape HTML to prevent XSS
   * Demonstrates: security-conscious DOM manipulation
   * @param {string} str
   * @returns {string}
   */
  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  /**
   * Truncate string to specified length
   * @param {string} str
   * @param {number} maxLength
   * @returns {string}
   */
  const truncate = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trim() + '...';
  };

  // Expose rendering functions
  window.__renderEventCard = createEventCard;
  window.__renderEventGrid = renderEventGrid;
  window.__renderEmptyState = renderEmptyState;
})();
