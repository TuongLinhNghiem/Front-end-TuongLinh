'use strict';

const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

const router = express.Router();
const pages = {
  '/dashboard': 'dashboard.html',
  '/avatar': 'avatar.html',
  '/design': 'design.html',
  '/wardrobe': 'wardrobe.html',
  '/shop': 'shop.html',
  '/recommend': 'recommend.html'
};

for (const [route, file] of Object.entries(pages)) {
  router.get(route, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', file));
  });
}

router.get('/profile', requireAuth, profileController.show);

module.exports = router;
