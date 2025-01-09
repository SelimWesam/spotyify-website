const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

// Import routes
const playlistRoutes = require('./routes/playlistRoutes');
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/auth');
const artistRoutes = require('./routes/artistRoutes');
const planRoutes = require('./routes/planRoutes'); // Ensure this exports a router
const likedSongsRoutes = require('./routes/likedSongsRouter');

// Import middleware
const authMiddleware = require('./middleware/authMiddleware'); // Ensure this exports a function

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/plans', planRoutes); // Ensure planRoutes is a router
app.use('/api/artists', artistRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/likedsongs', likedSongsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});