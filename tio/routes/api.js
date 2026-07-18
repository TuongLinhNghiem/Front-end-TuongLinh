'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const outfitController = require('../controllers/outfitController');

const router = express.Router();

router.use(requireAuth);
router.get('/me', profileController.me);
router.post('/me', profileController.update);
router.get('/outfits', outfitController.list);
router.post('/outfits', outfitController.create);
router.put('/outfits/:id', outfitController.update);
router.delete('/outfits/:id', outfitController.remove);
router.post('/outfits/:id/duplicate', outfitController.duplicate);

module.exports = router;
