const axios = require("axios");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

let cachedPrices = {};
let lastFetched = 0;
let isFetching = false;
const CACHE_DURATION = 60000; // 60 seconds

// Retry helper with exponential backoff
async function retry(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn(`⚠️ Retrying... (${3 - retries + 1})`);
    await new Promise(res => setTimeout(res, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}

/**
 * Gets the latest crypto price (BTC or ETH) from Redis cache
 */
async function getCryptoPrice(currency) {
  const data = await redis.get("crypto:price");
  if (!data) throw new Error("Price not available in cache");
  const prices = JSON.parse(data);
  return prices[currency];
}

async function fetchPrices() {
  const response = await axios.get(
    `${process.env.COINGECKO_API}?ids=bitcoin,ethereum&vs_currencies=usd`
  );
  return {
    BTC: response.data.bitcoin.usd,
    ETH: response.data.ethereum.usd,
  };
}

async function getCryptoPrice(currency) {
  const now = Date.now();

  // If recently fetched, use cached version
  if (now - lastFetched < CACHE_DURATION && cachedPrices[currency]) {
    return cachedPrices[currency];
  }

  // If another request is already fetching, wait and return cached
  if (isFetching && cachedPrices[currency]) {
    console.log("🔄 Waiting for existing price fetch...");
    return cachedPrices[currency];
  }

  isFetching = true;
  try {
    const prices = await retry(fetchPrices);
    cachedPrices = prices;
    lastFetched = now;
    return cachedPrices[currency];
  } catch (err) {
    console.error("❌ Price API failed:", err.response?.status || err.message);
    if (cachedPrices[currency]) {
      console.log("⚠️ Using stale cached price");
      return cachedPrices[currency];
    }
    throw err;
  } finally {
    isFetching = false;
  }
}

module.exports = { getCryptoPrice };
