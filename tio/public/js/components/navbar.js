/**
 * js/components/navbar.js
 * Injects the shared, animated, responsive navbar into every page.
 *
 * The navbar is built in JS (single source of truth) so its structure
 * and links stay identical across all pages. It hides auth-only links
 * when no session is present.
 *
 * Auth state is detected by calling /api/me — a 401 means logged-out.
 */

'use strict';

const Navbar = {
  /** Links shown only when authenticated. */
  appLinks: [
    { href: '/dashboard',  label: 'Dashboard' },
    { href: '/avatar',     label: 'Avatar' },
    { href: '/design',     label: 'Design' },
    { href: '/wardrobe',   label: 'Wardrobe' },
    { href: '/shop',       label: 'Shop' },
    { href: '/recommend',  label: 'Recommend' }
  ],

  /** Links shown when logged-out (landing context). */
  publicLinks: [
    { href: '/#features', label: 'Features' },
    { href: '/#about',    label: 'About' },
    { href: '/#demo',     label: 'Demo' }
  ],

  async init() {
    let user = null;
    try {
      user = await Api.getMe();
    } catch (_) { /* 401 = not logged in */ }

    const host = document.getElementById('navbar');
    if (!host) return;
    host.innerHTML = this._render(user);
    this._bind(user);
    this._highlightActive();
  },

  _render(user) {
    const links = user
      ? this.appLinks.map((l) => `<a class="navbar__link" href="${l.href}">${l.label}</a>`).join('')
      : this.publicLinks.map((l) => `<a class="navbar__link" href="${l.href}">${l.label}</a>`).join('');

    const accountHtml = user
      ? `
        <div class="navbar__account">
          <button class="navbar__avatar" id="navAvatar" aria-label="Account menu">
            ${Utils.escape(user.username.charAt(0).toUpperCase())}
          </button>
          <div class="navbar__menu" id="navMenu">
            <span class="navbar__menu-item" style="color:var(--color-dark-gray);font-size:12px;pointer-events:none">
              Signed in as <strong style="color:var(--color-ink)">${Utils.escape(user.username)}</strong>
            </span>
            <a class="navbar__menu-item" href="/profile">Profile</a>
            <a class="navbar__menu-item" href="/dashboard">Dashboard</a>
            <a class="navbar__menu-item navbar__menu-item--danger" href="/auth/logout">Logout</a>
          </div>
        </div>`
      : `
        <div class="navbar__links" style="margin-left:auto;gap:8px">
          <a class="btn btn--ghost btn--sm" href="/login">Login</a>
          <a class="btn btn--primary btn--sm" href="/register">Get Started</a>
        </div>`;

    return `
      <nav class="navbar" id="navEl">
        <div class="navbar__inner">
          <a class="navbar__brand" href="/">
            <span class="navbar__logo">T</span>
            TryItOn!
          </a>
          <div class="navbar__links" id="navLinks">${links}</div>
          ${accountHtml}
          <button class="navbar__toggle" id="navToggle" aria-label="Menu"><span></span></button>
        </div>
      </nav>`;
  },

  _bind(user) {
    const nav = document.getElementById('navEl');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    // Shadow on scroll
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile hamburger
    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('is-open');
        links.classList.toggle('is-open');
        // Move auth buttons inside the mobile menu when open
      });
    }

    // Account dropdown
    const avatar = document.getElementById('navAvatar');
    const menu = document.getElementById('navMenu');
    if (avatar && menu) {
      avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('is-open');
      });
      document.addEventListener('click', () => menu.classList.remove('is-open'));
    }

    // Close mobile menu on link click
    if (links) {
      links.addEventListener('click', (e) => {
        if (e.target.matches('a')) {
          toggle && toggle.classList.remove('is-open');
          links.classList.remove('is-open');
        }
      });
    }
  },

  _highlightActive() {
    const path = window.location.pathname;
    document.querySelectorAll('.navbar__link').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (href !== '/' && path.startsWith(href))) {
        a.classList.add('is-active');
      }
    });
  }
};

window.Navbar = Navbar;
