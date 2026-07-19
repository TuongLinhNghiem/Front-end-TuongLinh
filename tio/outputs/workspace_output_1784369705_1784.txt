/**
 * app.js
 * Application entry point.
 *
 * Wires together Express, the session store, static assets and all
 * route modules, then starts the HTTP server.
 *
 * Run:  npm start
 */

'use strict';

const express = require('express');
const session = require('express-session');
const path = require('path');

const config = require('./config');
const { db } = require('./db/connection');

// Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// View engine — we use plain HTML files served statically, but EJS is
// available for any server-rendered partials if needed later.
app.set('view engine', 'html');

/* ------------------------------------------------------------------ *
 * Middleware stack
 * ------------------------------------------------------------------ */
// Parse URL-encoded bodies (form submissions).
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (fetch() calls).
app.use(express.json());

// Serve everything under /public at the site root.
app.use(express.static(path.join(__dirname, 'public')));

// Session management. express-session uses an in-memory store by
// default, which is fine for a proof-of-concept. The sessions table
// exists in the schema for future migration to a persistent store.
app.use(
  session({
    ...config.session,
    name: 'tryiton.sid'
  })
);

// Make session user available to all templates / routes as `res.locals.currentUser`.
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

/* ------------------------------------------------------------------ *
 * Routes
 * ------------------------------------------------------------------ */
app.use('/', indexRoutes);      // landing + root
app.use('/auth', authRoutes);   // register / login / logout
app.use('/', pageRoutes);       // protected app pages (dashboard, profile, ...)
app.use('/api', apiRoutes);     // JSON API (outfits CRUD, etc.)

// 404 fallback — serves the custom not-found page.
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Centralised error handler (must be last).
app.use(errorHandler);

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */
app.listen(config.port, () => {
  console.log(`[TryItOn!] Server running → http://localhost:${config.port}`);
});

module.exports = app;
