const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const artistsController = require('../controllers/artistsController');

// Create artist (admin only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  artistsController.createArtist
);

// List artists (admin and viewer)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'viewer'),
  artistsController.listArtists
);

// Update artist (admin only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  artistsController.updateArtist
);

// Delete artist (admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  artistsController.deleteArtist
);

module.exports = router;
