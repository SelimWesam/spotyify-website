const express = require('express');
const router = express.Router();
const { authMiddleware, verifyAdmin } = require('../middleware/authMiddleware');
const artistController = require('../controllers/artistController');

// Public routes
router.get('/', artistController.getAllArtists);
router.get('/search/:artistId', artistController.getArtistById);
router.get('/search', artistController.searchArtists);

// Admin-only routes
router.post('/', authMiddleware, verifyAdmin, artistController.createArtist);
router.put('/:artistId', authMiddleware, verifyAdmin, artistController.updateArtist);
router.delete('/:artistId', authMiddleware, verifyAdmin, artistController.deleteArtist);
router.get('/:artistId/albums', artistController.getAlbumsByArtist);
router.post('/album', authMiddleware, verifyAdmin, artistController.addalbum);
router.put('/album/:albumId', authMiddleware, verifyAdmin, artistController.updateAlbum);
router.delete('/album/:albumId', authMiddleware, verifyAdmin, artistController.deleteAlbum);
router.get('/albums/byArtist/:knownName', artistController.getAlbumsByArtistName);

module.exports = router;