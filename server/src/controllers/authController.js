const User = require('../models/User');
const jwt = require('jsonwebtoken');
const response = require('../utils/response');
const crypto = require('crypto');
const { ethers } = require('ethers');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforcredifyhackathon2026', {
    expiresIn: '30d'
  });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
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
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      return response.success(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
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
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      return response.success(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
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

// In-memory nonce store (expires in 5 minutes)
const nonceStore = new Map();

/**
 * @desc    Get SIWE nonce
 * @route   GET /api/auth/siwe/nonce
 * @access  Public
 */
const getSiweNonce = async (req, res, next) => {
  try {
    const nonce = crypto.randomBytes(16).toString('hex');
    const expiry = Date.now() + 5 * 60 * 1000; // 5 mins
    nonceStore.set(nonce, expiry);
    
    // Periodically clean up expired nonces
    for (const [key, val] of nonceStore.entries()) {
      if (val < Date.now()) {
        nonceStore.delete(key);
      }
    }
    
    return response.success(res, { nonce }, 'Nonce generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify SIWE signature and authenticate/register organizer
 * @route   POST /api/auth/siwe/verify
 * @access  Public
 */
const verifySiweSignature = async (req, res, next) => {
  try {
    const { message, signature, name } = req.body;

    if (!message || !signature) {
      return response.error(res, 'Please provide message and signature', 400);
    }

    // Extract the nonce from EIP-4361 SIWE message
    const nonceMatch = message.match(/Nonce:\s*([a-fA-F0-9]+)/);
    if (!nonceMatch) {
      return response.error(res, 'Invalid SIWE message: Nonce not found', 400);
    }
    const nonce = nonceMatch[1];

    // Check nonce validity
    if (!nonceStore.has(nonce)) {
      return response.error(res, 'Nonce has expired or is invalid. Please try again.', 400);
    }
    const expiry = nonceStore.get(nonce);
    if (expiry < Date.now()) {
      nonceStore.delete(nonce);
      return response.error(res, 'Nonce has expired. Please try again.', 400);
    }

    // Burn the nonce immediately to prevent replay
    nonceStore.delete(nonce);

    // Verify signature using ethers
    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch (err) {
      return response.error(res, 'Failed to verify signature: ' + err.message, 400);
    }

    if (!recoveredAddress) {
      return response.error(res, 'Failed to recover address from signature', 400);
    }

    const walletLower = recoveredAddress.toLowerCase();

    // Find or create User by walletAddress
    let user = await User.findOne({ walletAddress: walletLower });

    if (!user) {
      // Auto-register new organizer with this wallet
      const namePlaceholder = name || `Organizer ${walletLower.slice(0, 6)}`;
      const emailPlaceholder = `${walletLower}@credify.app`;
      
      user = await User.create({
        name: namePlaceholder,
        email: emailPlaceholder,
        walletAddress: walletLower,
        role: 'organizer'
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return response.success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      token
    }, 'SIWE Login successful');

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerOrganizer,
  loginOrganizer,
  getMe,
  getSiweNonce,
  verifySiweSignature
};
