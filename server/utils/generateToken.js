const jwt = require('jsonwebtoken');

const generateToken = (userId, role = 'user') => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_ai_video_studio_2026';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn
  });
};

module.exports = {
  generateToken
};

