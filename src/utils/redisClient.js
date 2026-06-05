const Redis = require('ioredis');
require('dotenv').config();

// Determine runtime host and port from environment variables
const redisHost = process.env.REDIS_HOST || 'redis-cache';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD;

// Configuration object
const redisConfig = {
  host: redisHost,
  port: parseInt(redisPort, 10),
  family: 4,
  maxRetriesPerRequest: 1, // Crucial for the circuit breaker to catch drops instantly
  retryStrategy(times) {
    // Retry connection up to 3 times, then stop and let circuit breaker take over
    if (times > 3) return null; 
    return Math.min(times * 50, 2000);
  }
};

// 🌟 DEFENSIVE CREDENTIAL FILTERING
// Only attach password if it exists and isn't an empty string (wiped by Docker override)
if (redisPassword && redisPassword.trim() !== "") {
  redisConfig.password = redisPassword;
}

// Enable TLS secure handshake if explicitly requested in environment (Upstash Cloud)
if (process.env.REDIS_TLS === 'true') {
  redisConfig.tls = {};
}

// 1. Establish the Single Redis Connection Instance
const redis = new Redis(redisConfig);

// 2. Circuit Breaker State Management
let isRedisAvailable = true;

redis.on('connect', () => {
  isRedisAvailable = true;
  console.log(`🛡️  Centralized Redis Connected to [${redisHost}:${redisPort}]`);
});

redis.on('error', (err) => {
  if (isRedisAvailable) {
    console.error(`🚨 [CIRCUIT BREAKER] Redis link broken to [${redisHost}]! Tripping breaker to OPEN. Error:`, err.message);
    isRedisAvailable = false;
    
    // Self-healing check after 30 seconds
    setTimeout(() => {
      console.log('🔄 [CIRCUIT BREAKER] Attempting to reset breaker to HALF-OPEN...');
      isRedisAvailable = true;
    }, 30000);
  }
});

// 3. Export the client and the status reader function
module.exports = {
  redis,
  getRedisStatus: () => isRedisAvailable
};