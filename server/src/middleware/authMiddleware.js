const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const response = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforcredifyhackathon2026');

      // If database is offline, fallback to mock user to prevent query hang
      if (mongoose.connection.readyState !== 1) {
        req.user = {
          _id: decoded.id || '664cc56a7d7324a0d85485aa',
          name: 'Fallback Organizer',
          email: 'organizer@fallback.local',
          role: 'organizer'
        };
        return next();
      }

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
