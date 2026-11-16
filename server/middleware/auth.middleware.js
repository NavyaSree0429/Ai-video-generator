const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Authentication required. No token provided.');
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_ai_video_studio_2026';
    const decoded = jwt.verify(token, secret);

    // If MongoDB is connected, load real user from database
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return errorResponse(res, 401, 'User account no longer exists.');
      }
      if (!user.isActive) {
        return errorResponse(res, 403, 'User account has been deactivated.');
      }
      req.user = user;
    } else {
      // In offline/in-memory development mode
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || 'user',
        email: decoded.email || 'developer@example.com',
        name: decoded.name || 'Studio Developer'
      };
    }

    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized. Invalid or expired token.');
  }
};

module.exports = {
  protect
};

