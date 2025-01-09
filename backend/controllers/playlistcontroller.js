const db = require('../config/db');

// Create Playlist
exports.createPlaylist = (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // Extracted from the token

  if (!name || !userId) {
    return res.status(400).json({ message: 'Playlist name and user ID are required.' });
  }

  const query = 'INSERT INTO playlists (name, user_id) VALUES (?, ?)';
  db.query(query, [name, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating playlist' });
    }
    res.status(201).json({ message: 'Playlist created successfully' });
  });
};

// Get User Playlists
exports.getUserPlaylists = (req, res) => {
  const userId = req.user.id; // Extracted from the token
  db.query('SELECT * FROM playlists WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      // If no playlists exist, create a default playlist
      const defaultPlaylistQuery = 'INSERT INTO playlists (name, user_id) VALUES (?, ?)';
      db.query(defaultPlaylistQuery, ['My Playlist', userId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating default playlist' });
        }
        res.status(201).json([{ id: result.insertId, name: 'My Playlist', user_id: userId }]);
      });
    } else {
      res.status(200).json(results);
    }
  });
};

// Edit Playlist
exports.editPlaylist = (req, res) => {
  const { name } = req.body;
  const playlistId = req.params.playlistId;
  const userId = req.user.id;  // Assuming user ID is stored in JWT

  if (!name) {
    return res.status(400).json({ message: 'Playlist name is required.' });
  }

  // Ensure the playlist belongs to the current user
  const query = 'UPDATE playlists SET name = ? WHERE id = ? AND user_id = ?';
  db.query(query, [name, playlistId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating playlist', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }

    res.status(200).json({ message: 'Playlist updated successfully' });
  });
};

// Delete Playlist
exports.deletePlaylist = (req, res) => {
  const playlistId = req.params.playlistId;

  if (!playlistId) {
    return res.status(400).json({ message: 'Playlist ID is required.' });
  }

  const query = 'DELETE FROM playlists WHERE id = ? AND user_id = ?';
  db.query(query, [playlistId, req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Playlist not found or you do not have permission to delete this playlist.' });
    }

    res.status(200).json({ message: 'Playlist deleted successfully' });
  });
};

// Add Song to Playlist
exports.addSongToPlaylist = (req, res) => {
  const { songId, playlistId } = req.body;
  const userId = req.user.id; // Extracted from the token

  if (!songId || !playlistId) {
    return res.status(400).json({ message: 'Song ID and Playlist ID are required.' });
  }

  // Check if the playlist belongs to the current user
  const checkPlaylistQuery = 'SELECT * FROM playlists WHERE id = ? AND user_id = ?';
  db.query(checkPlaylistQuery, [playlistId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking playlist' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }

    // Add song to the playlist
    const addSongQuery = 'INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)';
    db.query(addSongQuery, [playlistId, songId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error adding song to playlist' });
      }
      res.status(200).json({ message: 'Song added to playlist' });
    });
  });
};

// Show Songs in Playlist
exports.showSongsInPlaylist = (req, res) => {
  const playlistId = req.params.playlistId;
  
  // Fetch songs based on playlistId from the database and return them
  const query = `
    SELECT songs.* 
    FROM songs 
    JOIN playlist_songs ON songs.id = playlist_songs.song_id 
    WHERE playlist_songs.playlist_id = ?;
  `;
  
  db.query(query, [playlistId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching songs for playlist' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No songs found in this playlist' });
    }

    res.status(200).json(results); // Return the list of songs
  });
};
exports.removeSongFromPlaylist = (req, res) => {
  const { songId, playlistId } = req.body;
  const userId = req.user.id;  // Extracted from the token

  if (!songId || !playlistId) {
    return res.status(400).json({ message: 'Song ID and Playlist ID are required.' });
  }

  // Ensure the playlist belongs to the current user
  const checkPlaylistQuery = 'SELECT * FROM playlists WHERE id = ? AND user_id = ?';
  db.query(checkPlaylistQuery, [playlistId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking playlist' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }

    // Remove the song from the playlist
    const removeSongQuery = 'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?';
    db.query(removeSongQuery, [playlistId, songId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error removing song from playlist' });
      }
      res.status(200).json({ message: 'Song removed from playlist' });
    });
  });
};
