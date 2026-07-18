/**
 * middleware/auth.js
 * Authentication & authorisation helpers.
 *
 *   requireAuth  — blocks access to any route that needs a logged-in user.
 *                  Unauthenticated requests are redirected to /login.
 *
 *   redirectIfAuth — used on /login and /register so already-logged-in
 *                  users skip straight to the dashboard.
 *
 *   attachUser   — exposes the session user to res.locals for templates.
 */

'use strict';

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    // Refresh the locals on every request (stateless-friendly).
    res.locals.currentUser = req.session.user;
    return next();
  }
  // For API routes, respond with JSON; otherwise redirect.
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  return res.redirect('/auth/login');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  return next();
}

function attachUser(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  next();
}

module.exports = { requireAuth, redirectIfAuth, attachUser };
