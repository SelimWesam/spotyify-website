const express = require('express');
const router = express.Router();
const { authMiddleware, verifyAdmin } = require('../middleware/authMiddleware');
const likedSongsController = require('../controllers/likedSongsController');

// Public routes
// Like a song
router.post('/like', authMiddleware, likedSongsController.likeSong);

// Unlike a song
router.post('/unlike', authMiddleware, likedSongsController.unlikeSong);

// Get user's liked songs
router.get('/liked-songs', authMiddleware, likedSongsController.getLikedSongs);

// Check if a song is liked
router.get('/is-liked/:songId', authMiddleware, likedSongsController.isLiked);

// Get like count for a song
router.get('/like-count/:songId', likedSongsController.getLikeCount);

module.exports = router;
