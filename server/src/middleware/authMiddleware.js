const jwt = require('jsonwebtoken');
const User = require('../models/User');
const response = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforcredifyhackathon2026');

      // Get user from database (excluding password field)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return response.error(res, 'Not authorized: User not found', 401);
      }

      next();
    } catch (error) {
      return response.error(res, 'Not authorized: Token verification failed', 401);
    }
  } else {
    return response.error(res, 'Not authorized: No token provided', 401);
  }
};

const organizerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'organizer' || req.user.role === 'mentor')) {
    next();
  } else {
    return response.error(res, 'Access denied: Organizers or Mentors only', 403);
  }
};

module.exports = {
  protect,
  organizerOnly
};
