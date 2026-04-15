/* ============================================
   StartupEvents — Modal System
   Syllabus: FE Unit IV — DOM manipulation,
             event propagation, focus trapping,
             dynamic element creation/destruction
   ============================================ */

(function () {
  'use strict';

  /**
   * Create and show a modal dialog
   * 
   * Demonstrates: createElement, event propagation (bubbling),
   *               event.stopPropagation, classList, focus trapping,
   *               keyboard events (Escape key), dynamic styles
   *
   * @param {Object} options
   * @param {string} options.title - Modal title
   * @param {string} options.content - HTML content for the modal body
   * @param {string} [options.size='md'] - Modal size: 'sm', 'md', 'lg'
   * @param {boolean} [options.closable=true] - Can be closed by clicking backdrop/Escape
   * @param {Array} [options.actions] - Footer buttons [{ label, className, onClick }]
   * @param {Function} [options.onClose] - Callback when modal is closed
   * @returns {{ close: Function, element: HTMLElement }}
   */
  const openModal = ({
    title = '',
    content = '',
    size = 'md',
    closable = true,
    actions = [],
    onClose = null,
  }) => {
    // ---- Create modal structure ----
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--active';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', title);

    const sizeClasses = { sm: 'max-width: 400px;', md: 'max-width: 600px;', lg: 'max-width: 900px;' };

    overlay.innerHTML = `
      <div class="modal" style="${sizeClasses[size] || sizeClasses.md}">
        <div class="modal__header">
          <h2 class="modal__title">${title}</h2>
          ${closable ? '<button class="modal__close" aria-label="Close modal">✕</button>' : ''}
        </div>
        <div class="modal__body">
          ${content}
        </div>
        ${actions.length > 0 ? `
          <div class="modal__footer">
            ${actions.map((action, i) => `
              <button class="${action.className || 'btn btn--outline'}" data-action-index="${i}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // ---- Close function ----
    const close = () => {
      overlay.classList.remove('modal-overlay--active');
      // Wait for CSS transition before removing from DOM
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = ''; // Re-enable scroll
      }, 200);

      if (typeof onClose === 'function') {
        onClose();
      }
    };

    // ---- Event Listeners ----

    // Close on backdrop click
    // Demonstrates: event propagation — click on overlay but NOT on modal content
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && closable) {
        close();
      }
    });

    // Close button
    const closeBtn = overlay.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    // Action buttons — event delegation on the footer
    // Demonstrates: event delegation, data attributes, closest()
    const footer = overlay.querySelector('.modal__footer');
    if (footer) {
      footer.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action-index]');
        if (button) {
          const index = parseInt(button.dataset.actionIndex, 10);
          const action = actions[index];
          if (action?.onClick) {
            action.onClick(close);
          }
        }
      });
    }

    // Close on Escape key
    // Demonstrates: keyboard event handling
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && closable) {
        close();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    // ---- Focus Trapping ----
    // Keeps focus within the modal for accessibility
    overlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = overlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    });

    // ---- Mount ----
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    // Focus the first focusable element
    const firstFocusable = overlay.querySelector('button, [href], input');
    if (firstFocusable) firstFocusable.focus();

    return { close, element: overlay };
  };

  // ---- Pre-built Modal Variants ----

  /**
   * Confirmation dialog
   * @param {string} message
   * @param {Function} onConfirm
   */
  const confirmDialog = (message, onConfirm) => {
    return openModal({
      title: '⚠️ Confirm Action',
      content: `<p style="color: var(--text-secondary); line-height: 1.6;">${message}</p>`,
      size: 'sm',
      actions: [
        { label: 'Cancel', className: 'btn btn--outline', onClick: (close) => close() },
        {
          label: 'Confirm',
          className: 'btn btn--primary',
          onClick: (close) => {
            if (typeof onConfirm === 'function') onConfirm();
            close();
          },
        },
      ],
    });
  };

  /**
   * Event detail popup
   * @param {Object} event - Event data
   */
  const eventDetailModal = (event) => {
    const dateStr = event.date
      ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'TBD';

    return openModal({
      title: event.title || 'Event Details',
      content: `
        <div style="display: grid; gap: var(--space-4);">
          <div>
            <strong style="color: var(--text-secondary);">📅 Date</strong>
            <p>${dateStr}</p>
          </div>
          <div>
            <strong style="color: var(--text-secondary);">📍 Location</strong>
            <p>${event.location?.venue || 'TBD'}, ${event.location?.city || ''}</p>
          </div>
          <div>
            <strong style="color: var(--text-secondary);">📝 Description</strong>
            <p style="color: var(--text-secondary); line-height: 1.6;">${event.description || 'No description'}</p>
          </div>
          ${event.capacity ? `
          <div>
            <strong style="color: var(--text-secondary);">👥 Capacity</strong>
            <p>${event.attendeeCount || 0} / ${event.capacity}</p>
          </div>` : ''}
        </div>
      `,
      size: 'md',
      actions: [
        { label: 'Close', className: 'btn btn--outline', onClick: (close) => close() },
        {
          label: '🎫 RSVP Now',
          className: 'btn btn--primary',
          onClick: (close) => {
            window.location.href = `event-detail.html?id=${event._id || event.id || ''}`;
            close();
          },
        },
      ],
    });
  };

  // Expose modal functions
  window.__openModal = openModal;
  window.__confirmDialog = confirmDialog;
  window.__eventDetailModal = eventDetailModal;
})();
