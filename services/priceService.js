const axios = require("axios");

let cachedPrices = {};
let lastFetched = 0;
const CACHE_DURATION = 60000; // 60 seconds

/**
 * Fetches the current USD price of a given cryptocurrency (BTC or ETH).
 * 
 * Uses a 60-second in-memory cache to reduce API calls.
 *
 * @param {string} currency - 'BTC' or 'ETH'
 * @returns {Promise<number>} - Current price in USD
 */
async function getCryptoPrice(currency) {
  const now = Date.now();

  // Use cached price if it's still valid
  if (now - lastFetched < CACHE_DURATION && cachedPrices[currency]) {
    console.log("⏳ Using cached price");
    return cachedPrices[currency];
  }

  try {
    const response = await axios.get(
      `${process.env.COINGECKO_API}?ids=bitcoin,ethereum&vs_currencies=usd`
    );

    // Update cache
    cachedPrices = {
      BTC: response.data.bitcoin.usd,
      ETH: response.data.ethereum.usd,
    };
    lastFetched = now;

    console.log("🔄 Fetched new prices:", cachedPrices);
    return cachedPrices[currency];
  } catch (error) {
    console.error("❌ Price API failed:", error.response?.status || error.message);

    // Fallback to stale cache if available
    if (cachedPrices[currency]) {
      console.log("⚠️ Using stale cached price");
      return cachedPrices[currency];
    }

    // No cache fallback, throw error
    throw error;
  }
}

module.exports = { getCryptoPrice };
