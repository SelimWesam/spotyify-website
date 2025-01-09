const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistcontroller');
const { authMiddleware } = require('../middleware/authMiddleware'); // assuming you have an auth middleware to verify JWT

// Create Playlist
router.post('/', authMiddleware, playlistController.createPlaylist);

// Get User Playlists
router.get('/', authMiddleware, playlistController.getUserPlaylists);

// Add Song to Playlist
router.post('/add-song', authMiddleware, playlistController.addSongToPlaylist);

// Route for editing a playlist
router.put('/:playlistId', authMiddleware, playlistController.editPlaylist);

// Delete Playlist
router.delete('/:playlistId', authMiddleware, playlistController.deletePlaylist);

router.get('/:playlistId/songs', authMiddleware, playlistController.showSongsInPlaylist);
// Route to remove song from playlist
router.post('/remove-song', authMiddleware, playlistController.removeSongFromPlaylist);
module.exports = router;
