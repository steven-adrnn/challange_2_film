const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const genresController = require('../controllers/genresController');

// Create genre (admin only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  genresController.createGenre
);

// List genres (admin and viewer)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'viewer'),
  genresController.listGenres
);

// Update genre (admin only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  genresController.updateGenre
);

// Delete genre (admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  genresController.deleteGenre
);

module.exports = router;
