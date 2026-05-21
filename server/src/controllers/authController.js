const User = require('../models/User');
const jwt = require('jsonwebtoken');
const response = require('../utils/response');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforcredifyhackathon2026', {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new organizer
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerOrganizer = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return response.error(res, 'Please provide all required fields (name, email, password)', 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return response.error(res, 'An organizer account with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'organizer'
    });

    if (user) {
      return response.success(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }, 'Organizer registered successfully', 201);
    } else {
      return response.error(res, 'Invalid user data provided', 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate organizer & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginOrganizer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response.error(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return response.success(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }, 'Login successful');
    } else {
      return response.error(res, 'Invalid email or password', 401);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current organizer profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };
    return response.success(res, user, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerOrganizer,
  loginOrganizer,
  getMe
};
