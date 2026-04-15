/* ============================================
   StartupEvents — Animated Stats Counter
   Syllabus: FE Unit II — DOM, control flow, functions
   ============================================ */

(function () {
  'use strict';

  /**
   * Animate a number from 0 to target
   * Demonstrates: arrow functions, requestAnimationFrame, Math methods
   *
   * @param {HTMLElement} element - The element to animate
   * @param {number} target - Target number
   * @param {number} duration - Animation duration in ms
   */
  const animateCounter = (element, target, duration = 2000) => {
    let startTime = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * eased);

      // Format numbers > 999 with commas
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  /**
   * Initialize counters using IntersectionObserver
   * Demonstrates: DOM traversal, data attributes, for...of loop
   */
  const initCounters = () => {
    const counters = document.querySelectorAll('[data-target]');

    if (counters.length === 0) return;

    // Use IntersectionObserver for scroll-triggered animation
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-target'), 10);
            animateCounter(entry.target, target);
            observer.unobserve(entry.target); // Only animate once
          }
        }
      },
      { threshold: 0.5 }
    );

    // Observe each counter element
    counters.forEach((counter) => observer.observe(counter));
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
