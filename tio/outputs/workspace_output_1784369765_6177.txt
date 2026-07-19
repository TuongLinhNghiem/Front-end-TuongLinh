/**
 * routes/index.js
 * Public top-level routes: landing page.
 */

'use strict';

const express = require('express');
const path = require('path');
const router = express.Router();

// Landing page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = router;
