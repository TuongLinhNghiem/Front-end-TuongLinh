/**
 * routes/api.js
 * JSON API surface consumed by the frontend.
 *
 * All routes require an authenticated session (see requireAuth).
 */

'use strict';

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const profile = require('../controllers/profileController');
const outfit = require('../controllers/outfitController');

// Everything under /api requires authentication.
router.use(requireAuth);

// Profile
router.get('/me', profile.me);
router.post('/me', profile.update);

// Outfits CRUD + duplicate
router.get('/outfits',           outfit.list);
router.post('/outfits',          outfit.create);
router.put('/outfits/:id',       outfit.update);
router.delete('/outfits/:id',    outfit.remove);
router.post('/outfits/:id/duplicate', outfit.duplicate);

module.exports = router;
