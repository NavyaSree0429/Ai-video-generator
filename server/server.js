const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./config/db');
const { initRedis } = require('./config/redis');

const PORT = process.env.PORT || 5000;

// Start HTTP Listener immediately
const server = app.listen(PORT, () => {
  console.log(`[Server] AI Video Studio Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`[Server] System status: http://localhost:${PORT}/api/v1/system-status`);
});

// Connect to Database asynchronously
connectDB();

// Initialize Redis if enabled
initRedis();

// Handle graceful shutdowns
const shutdown = () => {
  console.log('[Server] Gracefully shutting down...');
  server.close(() => {
    console.log('[Server] Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
