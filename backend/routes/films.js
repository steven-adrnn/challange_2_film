
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const filmsController = require('../controllers/filmsController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createFilmValidationRules,
  updateFilmValidationRules,
  validate,
} = require('../middleware/validateFilm');

// Setup multer storage for videos and thumbnails
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = 'uploads/';
    if (file.fieldname === 'video') {
      dest += 'videos/';
    } else if (file.fieldname === 'thumbnail') {
      dest += 'thumbnails/';
    }
    // Create directory if not exists
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes

// Create film (admin only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  createFilmValidationRules(),
  validate,
  filmsController.createFilm
);

// Update film (admin only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  updateFilmValidationRules(),
  validate,
  filmsController.updateFilm
);

// Search films (admin and viewer)
router.get(
  '/search',
  authenticateToken,
  authorizeRoles('admin', 'viewer'),
  filmsController.searchFilms
);

// Get film video URL (admin and viewer)
router.get(
  '/:id/video',
  authenticateToken,
  authorizeRoles('admin', 'viewer'),
  filmsController.getFilmVideoUrl
);

// Get film thumbnail URL (admin and viewer)
router.get(
  '/:id/thumbnail',
  authenticateToken,
  authorizeRoles('admin', 'viewer'),
  filmsController.getFilmThumbnailUrl
);

// Get film details (admin and viewer)
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'viewer'),
  filmsController.getFilmDetails
);

module.exports = router;
