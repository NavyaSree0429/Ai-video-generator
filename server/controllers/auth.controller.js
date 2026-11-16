const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// In-memory fallback cache when MongoDB is offline during initial local testing
const inMemoryUsers = new Map();

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email and password.');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Primary: Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return errorResponse(res, 400, 'An account with this email already exists.');
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password
      });

      const token = generateToken(user._id, user.role);

      return successResponse(res, 201, 'User registered successfully', {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // 2. Dev Fallback: When MongoDB is disconnected
    console.log('[Auth] Operating in local memory fallback mode (MongoDB offline).');
    if (inMemoryUsers.has(normalizedEmail)) {
      return errorResponse(res, 400, 'An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fakeId = new mongoose.Types.ObjectId().toString();

    const memUser = {
      _id: fakeId,
      id: fakeId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    inMemoryUsers.set(normalizedEmail, memUser);
    const token = generateToken(memUser._id, memUser.role);

    return successResponse(res, 201, 'User registered successfully (Dev Mode)', {
      token,
      user: {
        id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role
      }
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return errorResponse(res, 500, error.message || 'Error registering user');
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide both email and password.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Primary: Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      if (!user.isActive) {
        return errorResponse(res, 403, 'Your account has been deactivated.');
      }

      const token = generateToken(user._id, user.role);

      return successResponse(res, 200, 'Login successful', {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // 2. Dev Fallback: When MongoDB is disconnected
    console.log('[Auth] Operating in local memory fallback mode (MongoDB offline).');
    let memUser = inMemoryUsers.get(normalizedEmail);

    // If user doesn't exist yet in fallback mode, create on the fly so login succeeds for developer
    if (!memUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const fakeId = new mongoose.Types.ObjectId().toString();

      memUser = {
        _id: fakeId,
        id: fakeId,
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      inMemoryUsers.set(normalizedEmail, memUser);
    } else {
      const isMatch = await bcrypt.compare(password, memUser.password);
      if (!isMatch) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }
    }

    const token = generateToken(memUser._id, memUser.role);

    return successResponse(res, 200, 'Login successful (Dev Mode)', {
      token,
      user: {
        id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return errorResponse(res, 500, error.message || 'Error logging in');
  }
};

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
  return successResponse(res, 200, 'User profile retrieved', {
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

/**
 * Logout
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  return successResponse(res, 200, 'Logged out successfully');
};

module.exports = {
  register,
  login,
  getMe,
  logout
};

