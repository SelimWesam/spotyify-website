const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = (req, res) => {
  const { username, email, password, isAdmin } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const query = 'INSERT INTO users (username, email,password, isAdmin) VALUES (?, ?, ?, ?)';
  db.query(query, [username, email, hashedPassword,isAdmin], (err, result) => {
   
    if (err) {
      return res.status(500).json({ message: 'Error registering user.', error: err });
    }
    res.status(201).json({ message: 'User registered successfully.' });
  });
};

// Login User
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user.', error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful.', token });
  });
};

// Get User
exports.getUser = (req, res) => {
  const userId = req.user.id;  // Assuming the user ID is stored in the JWT token

  const query = 'SELECT id, username, email, isAdmin FROM users WHERE id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user details.', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(results[0]);
  });
};

// Update User
exports.updateUser = (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in the JWT token
  const { username, email, password, isAdmin } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const query = 'UPDATE users SET username = ?, email = ?, password = ?, isAdmin = ? WHERE id = ?';

  db.query(query, [username, email, hashedPassword, isAdmin, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating user.', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or no changes made.' });
    }

    res.status(200).json({ message: 'User updated successfully.' });
  });
};

// Delete User
exports.deleteUser = (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in the JWT token

  const query = 'DELETE FROM users WHERE id = ?';

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting user.', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  });
};
exports.getUserRole = (req, res) => {
  const userId = req.user.id;  // Assuming user ID is stored in the JWT token

  const query = 'SELECT isAdmin FROM users WHERE id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user role.', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return user role (isAdmin field)
    res.status(200).json({ isAdmin: results[0].isAdmin });
  });
};