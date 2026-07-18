/**
 * js/utils.js
 * Tiny shared helpers used across pages.
 */

'use strict';

const Utils = {
  /** Format an ISO date string into a friendly local date. */
  formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso.replace(' ', 'T') + 'Z');
    return d.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  },

  /** Read a query-string parameter from the current URL. */
  param(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  /** Escape user-supplied text before injecting into HTML. */
  escape(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  },

  /** Show then auto-hide a toast notification. */
  toast(message, type = 'info') {
    let host = document.querySelector('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = message;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-visible'));
    setTimeout(() => {
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 300);
    }, 2800);
  },

  /** Small promise-based delay. */
  sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
};

// Minimal toast styles injected once.
(function injectToastStyles() {
  if (document.getElementById('toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    .toast-host{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      z-index:3000;display:flex;flex-direction:column;gap:8px;align-items:center;}
    .toast{padding:12px 20px;border-radius:999px;font-size:14px;font-weight:600;
      background:#1d1d1f;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);
      opacity:0;transform:translateY(12px);transition:all .25s cubic-bezier(.16,1,.3,1);}
    .toast.is-visible{opacity:1;transform:translateY(0);}
    .toast--success{background:#1a8a3a;}
    .toast--error{background:#ff3b30;}
    .toast--info{background:#0a84ff;}
  `;
  document.head.appendChild(style);
})();

window.Utils = Utils;
