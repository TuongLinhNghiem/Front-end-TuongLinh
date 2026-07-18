/**
 * routes/pages.js
 * Application pages that require authentication.
 *
 * Each route simply serves its static HTML file. The page's own
 * JavaScript then fetches any dynamic data it needs from /api/*.
 *
 * `requireAuth` ensures unauthenticated visitors are redirected to
 * /login before reaching the static file.
 */

'use strict';

const path = require('path');
const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');

// Absolute path to /public so file serving works regardless of cwd.
const PUBLIC = path.join(__dirname, '..', 'public');

// Helper: serve a file from /public.
const serve = (file) => (req, res) => res.sendFile(file, { root: PUBLIC });

router.get('/dashboard',    requireAuth, serve('dashboard.html'));
router.get('/profile',      requireAuth, serve('profile.html'));
router.get('/avatar',       requireAuth, serve('avatar.html'));
router.get('/design',       requireAuth, serve('design.html'));
router.get('/wardrobe',     requireAuth, serve('wardrobe.html'));
router.get('/shop',         requireAuth, serve('shop.html'));
router.get('/recommend',    requireAuth, serve('recommend.html'));

module.exports = router;
