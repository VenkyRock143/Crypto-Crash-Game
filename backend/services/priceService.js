const Redis = require("ioredis");

// Connect to Redis with optional TLS for hosted environments
const redis = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
});

// Local fallback cache in case Redis is unavailable
let fallbackCache = {};
let fallbackFetchedAt = 0;
const FALLBACK_TTL = 60_000; // 60 seconds

/**
 * Get current crypto price (BTC or ETH) from Redis.
 * Falls back to in-memory cache if Redis is unreachable.
 *
 * @param {string} currency - Either 'BTC' or 'ETH'
 * @returns {Promise<number>} - Price in USD
 */
async function getCryptoPrice(currency) {
  try {
    const cachedData = await redis.get("crypto:price");

    if (!cachedData) {
      throw new Error("⛔ No price data found in Redis");
    }

    const prices = JSON.parse(cachedData);
    fallbackCache = prices;
    fallbackFetchedAt = Date.now();

    return prices[currency];
  } catch (err) {
    console.warn("⚠️ Redis error, using fallback:", err.message);

    const now = Date.now();
    if (fallbackCache[currency] && now - fallbackFetchedAt < FALLBACK_TTL) {
      return fallbackCache[currency];
    }

    throw new Error("❌ Price unavailable from both Redis and fallback");
  }
}

module.exports = { getCryptoPrice };
