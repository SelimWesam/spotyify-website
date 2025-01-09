const jwt = require('jsonwebtoken');

// Basic Authentication Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verifying the JWT token
    req.user = decoded; // Attach the decoded user info to the request object
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

// Authorization Middleware to check if the user is an Admin
const verifyAdmin = (req, res, next) => {
  const user = req.user;  // The user object is attached via JWT token

  if (!user.isAdmin) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  next();
};

module.exports = { authMiddleware, verifyAdmin }; // Export both middlewares
