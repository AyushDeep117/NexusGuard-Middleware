// 1. Import the shared Redis client and Circuit Breaker state from utils
const { redis, getRedisStatus } = require('../utils/redisClient');

async function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown_ip';
  
  // LOG 1: Observability - Live Traffic Telemetry Stream
  console.log(`[TRAFFIC] ${new Date().toISOString()} | Inbound Request from IP: ${ip} | Path: ${req.path}`);

  // FAIL OPEN: Check the centralized circuit breaker status
  if (!getRedisStatus()) {
    console.log(`⚠️ [FALLBACK] Serving request for ${ip} directly via Fallback Layer (Redis Offline).`);
    return next();
  }

  const redisKey = `ratelimit:${ip}`;
  const CAPACITY = 10;
  const REFILL_RATE = 1; // 1 token per second

  try {
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Fetch data array from our shared Redis instance
    const data = await redis.hmget(redisKey, 'tokens', 'lastRefill');
    let tokens = data[0] ? parseFloat(data[0]) : CAPACITY;
    let lastRefill = data[1] ? parseInt(data[1], 10) : currentTime;

    // Calculate elapsed time and token generation
    const elapsedTime = Math.max(0, currentTime - lastRefill);
    const generatedTokens = elapsedTime * REFILL_RATE;
    
    tokens = Math.min(CAPACITY, tokens + generatedTokens);
    lastRefill = currentTime;

    // Token check evaluation
    if (tokens >= 1) {
      tokens -= 1; // Deduct token
      
      await redis.hset(redisKey, 'tokens', tokens, 'lastRefill', lastRefill);
      await redis.expire(redisKey, 3600);
      
      return next(); 
    } else {
      // LOG 2: Observability - High Alert Security Throttling Log
      console.error(`❌ [SECURITY ALERT] Throttled IP: ${ip} - Token Bucket Exhausted.`);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'SentinelGate Shield: Rate limit exceeded. Please back off.'
      });
    }

  } catch (error) {
    console.error(`💥 [CRITICAL] Middleware runtime failure: ${error.message}`);
    return next(); // Fail Open gracefully if an unhandled execution error drops down
  }
}

module.exports = rateLimiter;