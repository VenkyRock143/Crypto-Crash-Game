const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
});

let fallbackCache = {};
let fallbackFetchedAt = 0;
const FALLBACK_TTL = 60000; // 60 seconds

/**
 * Fetches the crypto price (BTC or ETH) from Redis cache.
 * Falls back to in-memory cache if Redis is down.
 *
 * @param {string} currency - 'BTC' or 'ETH'
 * @returns {Promise<number>} - Price in USD
 */
async function getCryptoPrice(currency) {
  try {
    const cached = await redis.get("crypto:price");

    if (!cached) {
      throw new Error("⛔ No price data in Redis");
    }

    const prices = JSON.parse(cached);
    fallbackCache = prices;
    fallbackFetchedAt = Date.now();
    return prices[currency];
  } catch (err) {
    console.warn("⚠️ Redis unavailable, using fallback cache:", err.message);

    const now = Date.now();
    if (fallbackCache[currency] && now - fallbackFetchedAt < FALLBACK_TTL) {
      return fallbackCache[currency];
    }

    throw new Error("❌ No valid crypto price available");
  }
}

module.exports = { getCryptoPrice };
