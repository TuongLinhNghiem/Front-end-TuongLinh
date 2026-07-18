/**
 * controllers/authController.js
 * Registration, login, logout.
 *
 * Uses bcrypt (via the User model) for password hashing and
 * express-session for maintaining the logged-in state.
 */

'use strict';

const User = require('../models/user');
const validate = require('../middleware/validate');

const authController = {
  /**
   * GET /auth/register
   * Render the registration page.
   */
  showRegister(req, res) {
    res.sendFile('register.html', { root: 'public' });
  },

  /**
   * POST /auth/register
   * Validate input, enforce unique email/username, hash password, store user.
   */
  async register(req, res) {
    const { email, username, password, confirmPassword } = req.body;
    const errors = validate.registration({ email, username, password, confirmPassword });

    if (errors.length) {
      // Preserve input for the form; surface errors as a query string.
      const qs = new URLSearchParams({
        email: email || '',
        username: username || '',
        error: errors.join(' | ')
      }).toString();
      return res.redirect(`/register?${qs}`);
    }

    // Uniqueness checks.
    if (await User.findByEmail(email)) {
      return res.redirect(`/register?error=${encodeURIComponent('That email is already registered.')}`);
    }
    if (await User.findByUsername(username)) {
      return res.redirect(`/register?error=${encodeURIComponent('That username is already taken.')}`);
    }

    const user = await User.create({ email, username, password });

    // Auto-login the new user.
    req.session.user = { id: user.id, username: user.username, email: user.email };
    res.redirect('/dashboard');
  },

  /**
   * GET /auth/login
   * Render the login page.
   */
  showLogin(req, res) {
    res.sendFile('login.html', { root: 'public' });
  },

  /**
   * POST /auth/login
   * Verify credentials and establish a session.
   */
  async login(req, res) {
    const { email, password } = req.body;
    const errors = validate.login({ email, password });

    if (errors.length) {
      return res.redirect(`/login?error=${encodeURIComponent(errors[0])}`);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.redirect(`/login?error=${encodeURIComponent('No account found for that email.')}`);
    }

    const ok = await User.verifyPassword(password, user.password_hash);
    if (!ok) {
      return res.redirect(`/login?error=${encodeURIComponent('Incorrect password.')}`);
    }

    req.session.user = { id: user.id, username: user.username, email: user.email };
    res.redirect('/dashboard');
  },

  /**
   * POST /auth/logout  (also GET for convenience)
   * Destroy the session and return to the landing page.
   */
  logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie('tryiton.sid');
      res.redirect('/');
    });
  }
};

module.exports = authController;
