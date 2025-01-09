const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { authMiddleware, verifyAdmin } = require('../middleware/authMiddleware'); // Assuming you have an auth middleware to verify JWT

// Create Song (Only Admin can create)
router.post('/', authMiddleware, verifyAdmin, songController.createSong);

// Get Songs in Playlist (Authenticated user can fetch songs in a playlist)
router.get('/playlists/:playlistId', authMiddleware, songController.getSongsInPlaylist);

// Get All Songs (Authenticated user can fetch all songs)
router.get('/', authMiddleware, songController.getAllSongs);



router.get('/search', authMiddleware, songController.searchSongs);
// Search Songs (Authenticated users can search songs)
router.post('/upload', authMiddleware, verifyAdmin, songController.uploadFile);
// Delete Song (Only Admin can delete songs)
router.delete('/:songId', authMiddleware, verifyAdmin, songController.deleteSong);
router.get('/:songId', authMiddleware, songController.getSongById);

module.exports = router;
