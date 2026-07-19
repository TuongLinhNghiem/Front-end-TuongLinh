/**
 * js/pages/auth.js
 * Shared front-end logic for the Login and Register pages.
 *
 *   - Pre-fills the email/username from query params (sent back by the
 *     server on validation errors).
 *   - Surfaces server-side error messages (?error=…) in the alert banner.
 *   - Adds client-side validation feedback before submission.
 *   - Disables the submit button + shows a spinner while the request
 *     is in flight (progressive enhancement over the plain POST form).
 */

'use strict';

(function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm') || document.getElementById('registerForm');
    if (!form) return;

    const alertEl = document.getElementById('authAlert');
    const submitBtn = document.getElementById('submitBtn');

    /* --- Surface server-side error from the URL --- */
    const errorParam = Utils.param('error');
    if (errorParam && alertEl) {
      alertEl.textContent = errorParam;
    } else if (alertEl) {
      alertEl.classList.remove('alert--error');
    }

    /* --- Pre-fill fields preserved by the server --- */
    const prefillEmail = Utils.param('email');
    const prefillUser = Utils.param('username');
    if (prefillEmail)  form.querySelector('#email').value = prefillEmail;
    if (prefillUser && form.querySelector('#username')) form.querySelector('#username').value = prefillUser;

    /* --- Helper: mark a field as (in)valid --- */
    function setFieldError(input, hasError) {
      const field = input.closest('.field');
      if (!field) return;
      field.classList.toggle('field--error', hasError);
    }

    /* --- Per-field validation used on blur + submit --- */
    function validateField(input) {
      const id = input.id;
      let ok = true;
      if (id === 'email') ok = EMAIL_RE.test(input.value.trim());
      else if (id === 'username') ok = input.value.trim().length >= 3;
      else if (id === 'password') ok = input.value.length >= 8;
      else if (id === 'confirmPassword') ok = input.value === form.querySelector('#password').value && input.value.length >= 8;
      setFieldError(input, !ok);
      return ok;
    }

    form.querySelectorAll('.field__input').forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('field--error')) validateField(input);
      });
    });

    /* --- Submit: validate all fields, then submit the form normally --- */
    form.addEventListener('submit', (e) => {
      const inputs = [...form.querySelectorAll('.field__input')];
      const allValid = inputs.map(validateField).every(Boolean);
      if (!allValid) {
        e.preventDefault();
        const firstError = form.querySelector('.field--error .field__input');
        if (firstError) firstError.focus();
        return;
      }
      // UX: show a spinner while the server processes the form.
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px"></span>';
      }
    });
  });
})();
