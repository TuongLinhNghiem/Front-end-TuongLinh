'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/auth');

const router = express.Router();

// Mounted at /auth by app.js; route paths here deliberately omit the prefix.
router.get('/register', redirectIfAuth, authController.showRegister);
router.post('/register', redirectIfAuth, authController.register);
router.get('/login', redirectIfAuth, authController.showLogin);
router.post('/login', redirectIfAuth, authController.login);
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
