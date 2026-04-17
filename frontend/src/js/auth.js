(function () {
  'use strict';

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const actionsEl = document.querySelector('.navbar__actions');
  if (!actionsEl) return;

  const themeBtn = document.getElementById('theme-toggle');

  if (user) {
    const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
    const name = user.firstName || 'User';

    actionsEl.innerHTML = '';
    if (themeBtn) actionsEl.appendChild(themeBtn);

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.id = 'user-dropdown';
    const isOrganizer = user.role === 'organizer' || user.role === 'admin';
    const createLink = isOrganizer
      ? '<a href="dashboard.html#create-event" class="dropdown__item">✏️ Create Event</a>'
      : '';

    dropdown.innerHTML = `
      <button class="btn btn--ghost" style="display:flex;align-items:center;gap:var(--space-2);" id="user-dropdown-toggle">
        <div class="avatar avatar--sm">${initials}</div>
        <span style="font-size:var(--text-sm);">${name}</span>
      </button>
      <div class="dropdown__menu" id="user-dropdown-menu">
        <a href="dashboard.html" class="dropdown__item">📊 Dashboard</a>
        ${createLink}
        <button class="dropdown__item" id="logout-btn" style="color:var(--color-error);">🚪 Logout</button>
      </div>
    `;
    actionsEl.appendChild(dropdown);

    const toggle = dropdown.querySelector('#user-dropdown-toggle');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('dropdown--open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('dropdown--open'));

    dropdown.querySelector('#logout-btn').addEventListener('click', async () => {
      try {
        await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
      } catch { /* ignore */ }
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      window.location.href = 'index.html';
    });
  }
})();
