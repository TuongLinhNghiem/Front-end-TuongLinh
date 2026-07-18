/**
 * controllers/profileController.js
 * Read / update the authenticated user's profile.
 */

'use strict';

const User = require('../models/user');

const profileController = {
  /**
   * GET /profile
   * The HTML page fetches profile data via /api/me so the controller
   * only needs to serve the static file here.
   */
  show(req, res) {
    res.sendFile('profile.html', { root: 'public' });
  },

  /**
   * GET /api/me
   * Return the public-safe profile for the logged-in user.
   */
  async me(req, res) {
    const profile = await User.publicProfile(req.session.user.id);
    if (!profile) return res.status(404).json({ error: 'User not found.' });
    res.json(profile);
  },

  /**
   * POST /api/me
   * Update editable profile fields (username, measurements).
   */
  async update(req, res) {
    const { username, measurements } = req.body;
    const updated = await User.updateProfile(req.session.user.id, {
      username,
      measurements: measurements ? JSON.stringify(measurements) : null
    });
    // Keep the session in sync.
    req.session.user.username = updated.username;
    res.json(updated);
  }
};

module.exports = profileController;
