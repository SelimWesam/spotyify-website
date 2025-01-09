const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');

// Ensure the uploads directory exists or create it dynamically
const uploadDir = path.join(__dirname, '..', 'uploads');
const ensureUploadDirExists = async () => {
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Error ensuring uploads folder exists:', err);
  }
};
ensureUploadDirExists();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Serve the uploads folder as static files
const app = express();
app.use('/uploads', express.static(uploadDir));

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Unauthorized' });
};

// Upload File Endpoint
exports.uploadFile = (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file', error: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  });
};

// Create Song
exports.createSong = (req, res) => {
  const { title, artistKnownName, album_name, url } = req.body;

  if (!title || !artistKnownName || !album_name || !url) {
    return res.status(400).json({ message: 'Song details are incomplete.' });
  }

  // Find artist by known_name
  const findArtistQuery = 'SELECT known_name FROM artists WHERE known_name = ?';
  db.query(findArtistQuery, [artistKnownName], (err, artistResult) => {
    if (err) {
      return res.status(500).json({ message: 'Error searching for artist', error: err });
    }

    if (artistResult.length === 0) {
      return res.status(404).json({ message: `Artist '${artistKnownName}' not found.` });
    }

    // Insert new song with artist_known_name as a foreign key
    const insertSongQuery = 'INSERT INTO songs (title, artist_known_name, album_name, url) VALUES (?, ?, ?, ?)';
    db.query(insertSongQuery, [title, artistKnownName, album_name, url], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating song', error: err.message });
      }

      res.status(201).json({ message: 'Song created successfully', songId: result.insertId });
    });
  });
};

// Get All Songs
exports.getAllSongs = (req, res) => {
  const query = 'SELECT * FROM songs';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching songs', error: err });
    }

    res.status(200).json(results);
  });
};



// Get Songs in Playlist
exports.getSongsInPlaylist = (req, res) => {
  const playlistId = req.params.playlistId;

  if (!playlistId) {
    return res.status(400).json({ message: 'Playlist ID is required' });
  }

  const query = `
    SELECT songs.*, artists.known_name AS artistKnownName
    FROM songs
    JOIN playlist_songs ON songs.id = playlist_songs.song_id
    JOIN artists ON songs.artist_known_name = artists.known_name
    WHERE playlist_songs.playlist_id = ?
  `;
  db.query(query, [playlistId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching songs in playlist', error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No songs found in this playlist' });
    }
    res.status(200).json(results);
  });
};

// Delete Song
exports.deleteSong = [isAdmin, (req, res) => {
  const songId = req.params.songId;

  const query = 'DELETE FROM songs WHERE id = ?';
  db.query(query, [songId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting song', error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.status(200).json({ message: 'Song deleted successfully' });
  });
}];

// Search Songs
exports.searchSongs = (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  const sqlQuery = `
    SELECT songs.*, artists.known_name AS artistKnownName
    FROM songs 
    JOIN artists ON songs.artist_known_name = artists.known_name
    WHERE songs.title LIKE ? OR artists.known_name LIKE ? OR songs.album_name LIKE ?
  `;
  db.query(sqlQuery, [`%${query}%`, `%${query}%`, `%${query}%`], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error searching songs', error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No songs found.' });
    }
    res.status(200).json(results);
  });
};

// Get Song by ID
exports.getSongById = (req, res) => {
  const songId = req.params.songId;

  if (!songId) {
    return res.status(400).json({ message: 'Song ID is required.' });
  }

  const query = `
    SELECT songs.*, artists.known_name AS artistKnownName
    FROM songs 
    JOIN artists ON songs.artist_known_name = artists.known_name
    WHERE songs.id = ?
  `;
  db.query(query, [songId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching song', error: err });

    if (result.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.status(200).json(result[0]);
  });
};
