const axios = require("axios");

let cachedPrices = {};
let lastFetched = 0;

/**
Fetches the current USD price of a given cryptocurrency (BTC or ETH).
 
Uses a 10-second in-memory cache to reduce API calls.
 
@param {string} currency - 'BTC' or 'ETH'
@returns {Promise<number>} - Current price in USD
 */
async function getCryptoPrice(currency) {
  const now = Date.now();

  // Use cached price if it's still valid (within 10 seconds)
  if (now - lastFetched < 10000 && cachedPrices[currency]) {
    return cachedPrices[currency];
  }

  // Fetch prices from CoinGecko API
  const response = await axios.get(`${process.env.COINGECKO_API}?ids=bitcoin,ethereum&vs_currencies=usd`);

  // Update cache
  cachedPrices = {
    BTC: response.data.bitcoin.usd,
    ETH: response.data.ethereum.usd,
  };
  lastFetched = now;

  return cachedPrices[currency];
}

module.exports = { getCryptoPrice };
