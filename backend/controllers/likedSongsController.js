// likedSongsController.js
const db = require('../config/db');

// Like a Song
exports.likeSong = (req, res) => {
  const songId = parseInt(req.body.songId, 10); // Convert to integer
  const userId = req.user.id;

  if (!songId || isNaN(songId)) {
    return res.status(400).json({ message: 'Valid song ID is required.' });
  }

  // First check if the song exists
  db.query('SELECT id FROM songs WHERE id = ?', [songId], (err, songResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error checking song', error: err });
    }

    if (songResults.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Then try to insert the liked song
    const query = 'INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?)';
    db.query(query, [userId, songId], (err, result) => {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Song already liked' });
      }
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error liking song', error: err });
      }
      res.status(201).json({ message: 'Song liked successfully' });
    });
  });
};

// Unlike a Song
exports.unlikeSong = (req, res) => {
  const songId = parseInt(req.body.songId, 10); // Convert to integer
  const userId = req.user.id;

  if (!songId || isNaN(songId)) {
    return res.status(400).json({ message: 'Valid song ID is required.' });
  }

  const query = 'DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?';
  db.query(query, [userId, songId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error unliking song', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Liked song not found' });
    }

    res.status(200).json({ message: 'Song unliked successfully' });
  });
};

// Get User's Liked Songs
exports.getLikedSongs = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      s.*
    FROM songs s
    JOIN liked_songs ls ON s.id = ls.song_id
    WHERE ls.user_id = ?
    ORDER BY ls.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error fetching liked songs', error: err });
    }

    res.status(200).json(results);
  });
};

// Check if Song is Liked
exports.isLiked = (req, res) => {
  const songId = req.params.songId;
  const userId = req.user.id;

  const query = 'SELECT * FROM liked_songs WHERE user_id = ? AND song_id = ?';
  db.query(query, [userId, songId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking liked status', error: err });
    }

    res.status(200).json({ isLiked: results.length > 0 });
  });
};

// Get Like Count for Song
exports.getLikeCount = (req, res) => {
  const songId = req.params.songId;

  const query = 'SELECT COUNT(*) as likeCount FROM liked_songs WHERE song_id = ?';
  db.query(query, [songId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error getting like count', error: err });
    }

    res.status(200).json({ likeCount: results[0].likeCount });
  });
};