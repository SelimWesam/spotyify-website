const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {authMiddleware} = require('../middleware/authMiddleware'); // Protecting routes with authentication

// Register User
router.post('/register', authController.registerUser);

// Login User
router.post('/login', authController.loginUser);

// Get User
router.get('/me', authMiddleware, authController.getUser);

// Update User
router.put('/me', authMiddleware, authController.updateUser);

// Delete User
router.delete('/me', authMiddleware, authController.deleteUser);
router.get('/role', authMiddleware, authController.getUserRole);
module.exports = router;
