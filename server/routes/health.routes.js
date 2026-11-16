const express = require('express');
const router = express.Router();
const { successResponse } = require('../utils/apiResponse');
const { getDBStatus } = require('../config/db');
const { getRedisStatus } = require('../config/redis');
const { getStorageStatus } = require('../config/storage');
const { getFFmpegStatus } = require('../utils/ffmpegHelper');

// Quick health check
router.get('/health', (req, res) => {
  return successResponse(res, 200, 'AI Video Studio API is healthy', {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Comprehensive system status check
router.get('/system-status', (req, res) => {
  return successResponse(res, 200, 'System status retrieved', {
    service: 'AI Video Studio & Instagram Auto Publisher Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: getDBStatus(),
    redis: getRedisStatus(),
    storage: getStorageStatus(),
    ffmpeg: getFFmpegStatus(),
    mockMode: {
      instagram: process.env.INSTAGRAM_MOCK_MODE === 'true'
    }
  });
});

module.exports = router;

