const db = require('../config/db');

// Create Artist
exports.createArtist = (req, res) => {
  const { known_name, real_name } = req.body;

  if (!known_name || !real_name) {
    return res.status(400).json({ message: 'Artist known name and real name are required.' });
  }

  const query = 'INSERT INTO artists (known_name, real_name) VALUES (?, ?)';
  db.query(query, [known_name, real_name], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating artist', error: err });
    }
    res.status(201).json({ message: 'Artist created successfully', artistId: result.insertId });
  });
};



// Get All Artists
exports.getAllArtists = (req, res) => {
  const query = 'SELECT * FROM artists';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching artists', error: err });
    }
    res.status(200).json(results);
  });
};

// Get Artist by ID
exports.getArtistById = (req, res) => {
  const artistId = req.params.artistId;

  const query = 'SELECT * FROM artists WHERE id = ?';
  db.query(query, [artistId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching artist', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.status(200).json(results[0]);
  });
};

// Update Artist
exports.updateArtist = (req, res) => {
  const artistId = req.params.artistId;
  const { known_name, real_name } = req.body;

  if (!known_name || !real_name) {
    return res.status(400).json({ message: 'Artist known name and real name are required.' });
  }

  const query = 'UPDATE artists SET known_name = ?, real_name = ? WHERE id = ?';
  db.query(query, [known_name, real_name, artistId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating artist', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.status(200).json({ message: 'Artist updated successfully' });
  });
};

// Delete Artist
exports.deleteArtist = (req, res) => {
  const artistId = req.params.artistId;

  const query = 'DELETE FROM artists WHERE id = ?';
  db.query(query, [artistId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting artist', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.status(200).json({ message: 'Artist deleted successfully' });
  });
};

// Search Artists
exports.searchArtists = (req, res) => {
  const { query } = req.query;

  // Validate the query
  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  // Optional: Sanitize the query to prevent SQL injection
  const sanitizedQuery = `%${query.replace(/[^a-zA-Z0-9 ]/g, '')}%`;

  const sqlQuery = 'SELECT * FROM artists WHERE known_name LIKE ?';
  db.query(sqlQuery, [sanitizedQuery], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error searching artists', error: err });
    }

    // Return empty array if no results found
    if (results.length === 0) {
      return res.status(200).json({ message: 'No artists found', results: [] });
    }

    res.status(200).json(results);
  });
}
  // Add Album
exports.addalbum = (req, res) => {
  const { artistId, album_name } = req.body;
  console.log(artistId,album_name);
  // Validate required fields
  if (!artistId || !album_name) {
    return res.status(400).json({ 
      message: 'Both artist ID and album name are required.' 
    });
  }

  // First check if artist exists
  const checkArtistQuery = 'SELECT id FROM artists WHERE id = ?';
  db.query(checkArtistQuery, [artistId], (err, artistResults) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error checking artist existence', 
        error: err 
      });
    }

    if (artistResults.length === 0) {
      return res.status(404).json({ 
        message: 'Artist not found' 
      });
    }

    // Check if album name already exists for this artist
    const checkDuplicateQuery = 'SELECT id FROM albums WHERE artistID = ? AND album_name = ?';
    db.query(checkDuplicateQuery, [artistId, album_name], (err, albumResults) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error checking album existence', 
          error: err 
        });
      }

      if (albumResults.length > 0) {
        return res.status(409).json({ 
          message: 'An album with this name already exists for this artist' 
        });
      }

      // If all checks pass, insert the new album
      const insertQuery = 'INSERT INTO albums (artistID, album_name) VALUES (?, ?)';
      db.query(insertQuery, [artistId, album_name], (err, result) => {
        if (err) {
          return res.status(500).json({ 
            message: 'Error adding album', 
            error: err 
          });
        }

        // Return success response with the new album ID
        res.status(201).json({ 
          message: 'Album added successfully', 
          albumId: result.insertId,
          album: {
            id: result.insertId,
            artistId: artistId,
            album_name: album_name,
            created_at: new Date()
          }
        });
      });
    });
  });
};

exports.getAlbumsByArtist = (req, res) => {
  const artistId = req.params.artistId;
  
  const query = 'SELECT * FROM albums WHERE artistID = ?';
  db.query(query, [artistId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching albums', error: err });
    }
    res.status(200).json(results);
  });
};

// Update Album
exports.updateAlbum = (req, res) => {
  const albumId = req.params.albumId;
  const { album_name } = req.body;

  const query = 'UPDATE albums SET album_name = ? WHERE id = ?';
  db.query(query, [album_name, albumId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating album', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }
    res.status(200).json({ message: 'Album updated successfully' });
  });
};

// Delete Album
exports.deleteAlbum = (req, res) => {
  const albumId = req.params.albumId;

  const query = 'DELETE FROM albums WHERE id = ?';
  db.query(query, [albumId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting album', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }
    res.status(200).json({ message: 'Album deleted successfully' });
  });
};
exports.getAlbumsByArtistName = (req, res) => {
  const artistName = req.params.knownName;

  // First get the artist ID from the known name
  const getArtistQuery = 'SELECT id FROM artists WHERE known_name = ?';
  db.query(getArtistQuery, [artistName], (err, artistResults) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error finding artist', 
        error: err 
      });
    }

    if (artistResults.length === 0) {
      return res.status(404).json({ 
        message: 'Artist not found' 
      });
    }

    const artistId = artistResults[0].id;

    // Then get all albums for this artist
    const getAlbumsQuery = 'SELECT * FROM albums WHERE artistID = ?';
    db.query(getAlbumsQuery, [artistId], (err, albumResults) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error fetching albums', 
          error: err 
        });
      }

      res.status(200).json(albumResults);
    });
  });
}


