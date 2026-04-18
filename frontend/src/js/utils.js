/* ============================================
   StartupEvents — Utility Functions
   Syllabus: FE Unit II — Functions, data types,
             operators, browser interaction
   ============================================ */

(function () {
  'use strict';

  // Global API Base URL (Environment Aware)
  // We use a safe check because import.meta.env is only available during Vite builds
  let apiUrl = '/api/v1';
  try {
    apiUrl = import.meta.env.VITE_API_URL || apiUrl;
  } catch (e) {
    // If we're on the live Render/Vercel site and Vite didn't inject the env,
    // fallback to the production backend URL automatically.
    if (window.location.hostname !== 'localhost') {
      apiUrl = 'https://startup-event-app-backend.onrender.com/api/v1';
    }
  }
  window.API_BASE_URL = apiUrl;

  // ============ MOBILE NAV TOGGLE ============
  const setupNavToggle = () => {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('navbar__links--open');
      });

      // Close nav when clicking a link (mobile)
      links.querySelectorAll('.navbar__link').forEach((link) => {
        link.addEventListener('click', () => {
          links.classList.remove('navbar__links--open');
        });
      });
    }
  };

  // ============ DROPDOWN TOGGLE ============
  const setupDropdowns = () => {
    const dropdownToggle = document.getElementById('user-dropdown-toggle');
    const dropdown = document.getElementById('user-dropdown');

    if (dropdownToggle && dropdown) {
      dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('dropdown--open');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        dropdown.classList.remove('dropdown--open');
      });
    }
  };

  // ============ DASHBOARD TAB SWITCHING ============
  const setupDashboardTabs = () => {
    const sidebarLinks = document.querySelectorAll('.dashboard__sidebar-link');

    if (sidebarLinks.length === 0) return;

    const switchToTab = (tabName) => {
      const target = document.querySelector(`[data-tab="${tabName}"]`);
      if (!target) return;
      
      sidebarLinks.forEach((l) => l.classList.remove('dashboard__sidebar-link--active'));
      target.classList.add('dashboard__sidebar-link--active');
      
      const allTabs = document.querySelectorAll('[id^="tab-"]');
      allTabs.forEach((tab) => {
        tab.style.display = tab.id === `tab-${tabName}` ? '' : 'none';
      });

      // Notify the page that a tab was switched (useful for lazy-loading analytics)
      if (typeof window.__onTabSwitch === 'function') {
        window.__onTabSwitch(tabName);
      }
    };

    sidebarLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = link.dataset.tab;
        if (tabName) switchToTab(tabName);
      });
    });

    // Activate tab from URL hash (e.g. dashboard.html#create-event)
    const hash = window.location.hash.replace('#', '');
    if (hash) switchToTab(hash);
  };

  // ============ TOAST NOTIFICATIONS ============

  /**
   * Show a toast notification
   * Demonstrates: createElement, template literals, setTimeout, dynamic styling
   *
   * @param {{ type: 'success'|'error'|'warning'|'info', title: string, message: string, duration?: number }}
   */
  window.showToast = ({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type]}</span>
      <div class="toast__content">
        <div class="toast__title">${title}</div>
        <div class="toast__message">${message}</div>
      </div>
      <button class="toast__close" aria-label="Close notification">✕</button>
    `;

    // Close on click
    toast.querySelector('.toast__close').addEventListener('click', () => {
      toast.style.animation = 'fadeInUp 0.2s ease reverse';
      setTimeout(() => toast.remove(), 200);
    });

    container.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'fadeInUp 0.2s ease reverse';
        setTimeout(() => toast.remove(), 200);
      }
    }, duration);
  };

  // ============ FORMAT HELPERS ============

  /**
   * Format a date string to human-readable
   * Demonstrates: Date object, Intl.DateTimeFormat
   * @param {string} dateStr
   * @returns {string}
   */
  window.formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  /**
   * Format a number with commas
   * Demonstrates: toLocaleString
   * @param {number} num
   * @returns {string}
   */
  window.formatNumber = (num) => num.toLocaleString('en-IN');

  // ============ INITIALIZE ============
  const init = () => {
    setupNavToggle();
    setupDropdowns();
    setupDashboardTabs();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
