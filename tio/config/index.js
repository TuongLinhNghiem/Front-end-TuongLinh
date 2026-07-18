/**
 * config/index.js
 * Central application configuration.
 * Keeping all tunable values in one place makes the app easy to
 * re-configure across environments (dev, staging, production).
 */

'use strict';

const path = require('path');

module.exports = {
  // HTTP port the Express server listens on.
  port: process.env.PORT || 3000,

  // Application metadata shown across pages.
  appName: 'TryItOn!',
  appTagline: 'Design your style before you wear it.',

  // Database file location (SQLite single-file database).
  dbPath: path.join(__dirname, '..', 'db', 'tryiton.sqlite'),

  // express-session configuration.
  session: {
    // In production this MUST be replaced with a long random secret
    // stored in an environment variable.
    secret: process.env.SESSION_SECRET || 'tryiton-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Set to true when serving over HTTPS in production.
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  },

  // Password hashing cost factor for bcrypt.
  bcryptRounds: 10
};
