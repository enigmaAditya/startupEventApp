(function () {
  'use strict';

  // Define global logout function FIRST (so it's available when buttons reference it)
  window.__logout = async () => {
    console.log('🚪 Initiating logout...');
    try {
      if (window.API_BASE_URL) {
        await fetch(window.API_BASE_URL + '/auth/logout', { method: 'POST', credentials: 'include' });
      }
    } catch (e) { console.warn('Logout API call failed, proceeding with local cleanup', e); }

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');

    // Force redirect to root home
    window.location.replace('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const actionsEl = document.querySelector('.navbar__actions');
  if (!actionsEl) return;

  if (user) {
    const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
    const name = user.firstName || 'User';

    // Preserve theme toggle button before clearing
    const existingThemeBtn = document.getElementById('theme-toggle');

    actionsEl.innerHTML = '';

    // Re-create theme toggle (since innerHTML='' destroyed the original's event listeners)
    const themeBtn = document.createElement('button');
    themeBtn.className = 'btn btn--ghost btn--icon';
    themeBtn.id = 'theme-toggle';
    themeBtn.setAttribute('aria-label', 'Toggle theme');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeBtn.textContent = currentTheme === 'light' ? '☀️' : '🌙';
    themeBtn.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const next = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('startupevents-theme', next);
      themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
    });
    actionsEl.appendChild(themeBtn);

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.id = 'user-dropdown';
    const isOrganizer = user.role === 'organizer' || user.role === 'admin';
    const createLink = isOrganizer
      ? '<a href="/dashboard#create-event" class="dropdown__item">✏️ Create Event</a>'
      : '';

    dropdown.innerHTML = `
      <button class="btn btn--ghost" style="display:flex;align-items:center;gap:var(--space-2);" id="user-dropdown-toggle">
        <div class="avatar avatar--sm">${initials}</div>
        <span style="font-size:var(--text-sm);">${name}</span>
      </button>
      <div class="dropdown__menu" id="user-dropdown-menu">
        <a href="/dashboard" class="dropdown__item">📊 Dashboard</a>
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

    const logoutBtn = dropdown.querySelector('#logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => window.__logout());
  }
})();
