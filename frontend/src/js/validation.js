/* ============================================
   StartupEvents — Form Validation
   Syllabus: FE Unit II — Functions, objects, arrays,
             data types, control flow, event handling
   ============================================ */

(function () {
  'use strict';

  // ---- Validation Rules (Object with arrow functions) ----
  // Demonstrates: objects, arrow functions, regex, ternary

  const validators = {
    /** @param {string} value @returns {boolean} */
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

    /** @param {string} value @returns {boolean} */
    password: (value) =>
      value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value),

    /** @param {string} value @returns {boolean} */
    name: (value) => value.trim().length >= 2,

    /** @param {string} value @returns {boolean} */
    required: (value) => value.trim().length > 0,

    /** @param {number} value @param {number} min @param {number} max @returns {boolean} */
    range: (value, min, max) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
  };

  // ---- Error Messages (Object) ----
  const errorMessages = {
    email: 'Please enter a valid email address',
    password: 'Password must be at least 8 characters with 1 uppercase letter and 1 number',
    name: 'Name must be at least 2 characters',
    required: 'This field is required',
    confirmPassword: 'Passwords do not match',
    terms: 'You must agree to the terms',
    range: 'Value is out of range',
  };

  /**
   * Validate a single field
   * Demonstrates: object destructuring, optional chaining, computed properties
   *
   * @param {string} fieldType - The type of validation to apply
   * @param {string} value - The value to validate
   * @returns {{ isValid: boolean, message: string }}
   */
  const validateField = (fieldType, value) => {
    const isValid = validators[fieldType]?.(value) ?? true;
    return {
      isValid,
      message: isValid ? '' : (errorMessages[fieldType] || 'Invalid input'),
    };
  };

  /**
   * Show or clear error on a form field
   * Demonstrates: classList, DOM traversal, conditional logic
   *
   * @param {HTMLElement} input - The input element
   * @param {string} errorId - The error message element ID
   * @param {{ isValid: boolean, message: string }} result
   */
  const showFieldStatus = (input, errorId, result) => {
    const errorEl = document.getElementById(errorId);

    if (result.isValid) {
      input.classList.remove('form-input--error');
      input.classList.add('form-input--success');
      if (errorEl) errorEl.textContent = '';
    } else {
      input.classList.remove('form-input--success');
      input.classList.add('form-input--error');
      if (errorEl) errorEl.textContent = result.message;
    }
  };

  /**
   * Password strength checker
   * Demonstrates: if/else chain, arrays, score calculation
   *
   * @param {string} password
   * @returns {{ score: number, label: string, color: string }}
   */
  const checkPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Map score to label and color using array index
    const levels = [
      { label: '', color: 'var(--bg-tertiary)' },
      { label: 'Weak', color: 'var(--color-error)' },
      { label: 'Fair', color: 'var(--color-warning)' },
      { label: 'Good', color: 'var(--color-info)' },
      { label: 'Strong', color: 'var(--color-success)' },
      { label: 'Very Strong', color: 'var(--color-success)' },
    ];

    const level = levels[Math.min(score, levels.length - 1)];
    return { score, ...level };
  };

  /**
   * Update password strength UI
   * Demonstrates: for loop, dynamic styling, template literals
   *
   * @param {string} password
   */
  const updatePasswordStrength = (password) => {
    const strengthText = document.getElementById('strength-text');
    const { score, label, color } = checkPasswordStrength(password);

    // Update strength bars (1-4)
    for (let i = 1; i <= 4; i++) {
      const bar = document.getElementById(`strength-bar-${i}`);
      if (bar) {
        bar.style.background = i <= score ? color : 'var(--bg-tertiary)';
      }
    }

    if (strengthText) {
      strengthText.textContent = label;
      strengthText.style.color = color;
    }
  };

  // ============ Form-specific Handlers ============

  /**
   * Setup Login Form Validation
   * Demonstrates: addEventListener, event.preventDefault, form data
   */
  const setupLoginForm = () => {
    const form = document.getElementById('login-form');
    if (!form) return;

    // Real-time validation on blur
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const result = validateField('email', emailInput.value);
        showFieldStatus(emailInput, 'login-email-error', result);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('blur', () => {
        const result = validateField('required', passwordInput.value);
        showFieldStatus(passwordInput, 'login-password-error', result);
      });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const emailResult = validateField('email', emailInput?.value || '');
      const passwordResult = validateField('required', passwordInput?.value || '');

      showFieldStatus(emailInput, 'login-email-error', emailResult);
      showFieldStatus(passwordInput, 'login-password-error', passwordResult);

      const allValid = [emailResult, passwordResult].every((r) => r.isValid);

      if (allValid) {
        const submitBtn = document.getElementById('login-submit-btn');
        if (submitBtn) {
          submitBtn.textContent = 'Logging in...';
          submitBtn.disabled = true;
        }

        try {
          const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: emailInput.value,
              password: passwordInput.value,
            }),
          });
          const data = await res.json();

          if (res.ok && data.success) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('accessToken', data.data.accessToken);
            if (window.showToast) {
              window.showToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${data.data.user.firstName}` });
            }
            const dashboardUrl = (data.data.user.role === 'organizer' || data.data.user.role === 'admin') 
              ? 'organizer-dashboard.html' 
              : 'dashboard.html';
            setTimeout(() => { window.location.href = dashboardUrl; }, 800);
          } else {
            const msg = data.error?.message || data.errors?.[0]?.msg || 'Invalid email or password';
            showFieldStatus(emailInput, 'login-email-error', { isValid: false, message: msg });
            if (submitBtn) { submitBtn.textContent = 'Log In'; submitBtn.disabled = false; }
          }
        } catch {
          showFieldStatus(emailInput, 'login-email-error', { isValid: false, message: 'Network error — is the server running?' });
          if (submitBtn) { submitBtn.textContent = 'Log In'; submitBtn.disabled = false; }
        }
      }
    });
  };

  /**
   * Setup Register Form Validation
   * Demonstrates: spread operator, destructuring, complex validation
   */
  const setupRegisterForm = () => {
    const form = document.getElementById('register-form');
    if (!form) return;

    const fields = {
      firstName: document.getElementById('register-firstname'),
      lastName: document.getElementById('register-lastname'),
      email: document.getElementById('register-email'),
      password: document.getElementById('register-password'),
      confirmPassword: document.getElementById('register-confirm-password'),
      terms: document.getElementById('register-terms'),
    };

    // Real-time validation on input/blur
    if (fields.firstName) {
      fields.firstName.addEventListener('blur', () => {
        showFieldStatus(fields.firstName, 'register-firstname-error',
          validateField('name', fields.firstName.value));
      });
    }

    if (fields.lastName) {
      fields.lastName.addEventListener('blur', () => {
        showFieldStatus(fields.lastName, 'register-lastname-error',
          validateField('name', fields.lastName.value));
      });
    }

    if (fields.email) {
      fields.email.addEventListener('blur', () => {
        showFieldStatus(fields.email, 'register-email-error',
          validateField('email', fields.email.value));
      });
    }

    // Password — real-time strength check
    if (fields.password) {
      fields.password.addEventListener('input', () => {
        updatePasswordStrength(fields.password.value);
      });

      fields.password.addEventListener('blur', () => {
        showFieldStatus(fields.password, 'register-password-error',
          validateField('password', fields.password.value));
      });
    }

    // Confirm password
    if (fields.confirmPassword) {
      fields.confirmPassword.addEventListener('blur', () => {
        const matches = fields.password?.value === fields.confirmPassword.value;
        showFieldStatus(fields.confirmPassword, 'register-confirm-password-error', {
          isValid: matches && fields.confirmPassword.value.length > 0,
          message: matches ? '' : errorMessages.confirmPassword,
        });
      });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const results = [
        { input: fields.firstName, errorId: 'register-firstname-error', result: validateField('name', fields.firstName?.value || '') },
        { input: fields.lastName, errorId: 'register-lastname-error', result: validateField('name', fields.lastName?.value || '') },
        { input: fields.email, errorId: 'register-email-error', result: validateField('email', fields.email?.value || '') },
        { input: fields.password, errorId: 'register-password-error', result: validateField('password', fields.password?.value || '') },
        {
          input: fields.confirmPassword,
          errorId: 'register-confirm-password-error',
          result: {
            isValid: fields.password?.value === fields.confirmPassword?.value && (fields.confirmPassword?.value || '').length > 0,
            message: errorMessages.confirmPassword,
          },
        },
      ];

      results.forEach(({ input, errorId, result }) => {
        if (input) showFieldStatus(input, errorId, result);
      });

      const termsChecked = fields.terms?.checked;
      const termsError = document.getElementById('register-terms-error');
      if (!termsChecked && termsError) {
        termsError.textContent = errorMessages.terms;
      } else if (termsError) {
        termsError.textContent = '';
      }

      const allValid = results.every((r) => r.result.isValid) && termsChecked;

      if (allValid) {
        const submitBtn = document.getElementById('register-submit-btn');
        if (submitBtn) {
          submitBtn.textContent = 'Creating account...';
          submitBtn.disabled = true;
        }

        const roleSelect = document.getElementById('register-role');

        try {
          const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              firstName: fields.firstName.value.trim(),
              lastName: fields.lastName.value.trim(),
              email: fields.email.value.trim(),
              password: fields.password.value,
              role: roleSelect?.value || 'attendee',
            }),
          });
          const data = await res.json();

          if (res.ok && data.success) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('accessToken', data.data.accessToken);
            if (window.showToast) {
              window.showToast({ type: 'success', title: 'Account created!', message: `Welcome, ${data.data.user.firstName}!` });
            }
            const dashboardUrl = (data.data.user.role === 'organizer' || data.data.user.role === 'admin') 
              ? 'organizer-dashboard.html' 
              : 'dashboard.html';
            setTimeout(() => { window.location.href = dashboardUrl; }, 800);
          } else {
            const msg = data.error?.message || data.errors?.[0]?.msg || 'Registration failed';
            showFieldStatus(fields.email, 'register-email-error', { isValid: false, message: msg });
            if (submitBtn) { submitBtn.textContent = 'Create Account'; submitBtn.disabled = false; }
          }
        } catch {
          showFieldStatus(fields.email, 'register-email-error', { isValid: false, message: 'Network error — is the server running?' });
          if (submitBtn) { submitBtn.textContent = 'Create Account'; submitBtn.disabled = false; }
        }
      }
    });
  };

  /**
   * Setup RSVP Form Validation (event-detail handles its own RSVP inline)
   */
  const setupRSVPForm = () => {};

  // ============ Initialize All Forms ============
  const init = () => {
    setupLoginForm();
    setupRegisterForm();
    setupRSVPForm();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
