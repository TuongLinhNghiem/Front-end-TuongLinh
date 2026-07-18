/**
 * js/main.js
 * Global bootstrapping shared by every page:
 *   - initialises the navbar
 *   - wires the IntersectionObserver that animates .reveal elements
 *   - applies a subtle page-enter transition to <main>
 *   - injects the shared footer (buildFooter defined below)
 */

'use strict';

/** Shared footer markup injected into #footer placeholders. */
function buildFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__col">
          <div class="footer__brand">TryItOn!</div>
          <p class="footer__tag">Design your style before you wear it. A fashion outfit design platform.</p>
        </div>
        <div class="footer__col">
          <h4>Product</h4>
          <a href="/#features">Features</a>
          <a href="/#demo">Demo</a>
          <a href="/avatar">Avatar Designer</a>
          <a href="/design">Outfit Designer</a>
        </div>
        <div class="footer__col">
          <h4>Account</h4>
          <a href="/login">Login</a>
          <a href="/register">Get Started</a>
          <a href="/dashboard">Dashboard</a>
        </div>
        <div class="footer__col">
          <h4>Resources</h4>
          <a href="/shop">Shop</a>
          <a href="/recommend">Recommendations</a>
          <a href="/wardrobe">My Wardrobe</a>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© ${year} TryItOn! — University thesis proof-of-concept.</span>
        <span>Built with Node.js · Express · SQLite</span>
      </div>
    </footer>`;
}
window.buildFooter = buildFooter;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navbar (async — detects auth state via /api/me).
  if (window.Navbar) Navbar.init();

  // 2. Page-enter transition.
  const main = document.querySelector('main');
  if (main) main.classList.add('page-enter');

  // 3. Reveal-on-scroll for any element carrying .reveal.
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // 4. Inject footer.
  const footerHost = document.getElementById('footer');
  if (footerHost) footerHost.innerHTML = buildFooter();
});
