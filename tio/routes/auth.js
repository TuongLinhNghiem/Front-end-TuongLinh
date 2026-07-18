/**
 * routes/auth.js
 * Authentication routes: register, login, logout.
 *
 * `redirectIfAuth` keeps already-logged-in users out of the auth forms.
 */

'use strict';

const express = require('express');
const router = express.Router();

const auth = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/auth');

// Registration
router.get('/register', redirectIfAuth, auth.showRegister);
router.post('/register', auth.register);

// Login
router.get('/login', redirectIfAuth, auth.showLogin);
router.post('/login', auth.login);

// Logout (both verbs supported for convenience)
router.post('/logout', auth.logout);
router.get('/logout', auth.logout);

module.exports = router;
