const Redis = require('ioredis');

let redisClient = null;
let isRedisConnected = false;

const initRedis = () => {
  if (process.env.USE_REDIS_QUEUE !== 'true') {
    console.log('[Redis] Background queue using local execution (USE_REDIS_QUEUE is false).');
    return null;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Max connection attempts exceeded. Disabling queue connection.');
          return null;
        }
        return Math.min(times * 1000, 3000);
      }
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('[Redis] Connected successfully to Redis.');
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      console.warn(`[Redis] Connection warning: ${err.message}`);
    });

    return redisClient;
  } catch (error) {
    console.warn(`[Redis] Initialization warning: ${error.message}`);
    return null;
  }
};

const getRedisStatus = () => ({
  enabled: process.env.USE_REDIS_QUEUE === 'true',
  connected: isRedisConnected
});

module.exports = {
  initRedis,
  getRedisClient: () => redisClient,
  getRedisStatus
};

