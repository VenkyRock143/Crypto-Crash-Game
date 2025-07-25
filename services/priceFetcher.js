const axios = require("axios");
const Redis = require("ioredis");
const dotenv = require("dotenv");

dotenv.config();

// Redis connection setup
const redis = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
});

// CoinGecko API URL to fetch BTC and ETH prices in USD
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";

// Fetch latest prices and cache them in Redis for 60 seconds
async function fetchAndStorePrices() {
  try {
    const response = await axios.get(COINGECKO_URL);

    const prices = {
      BTC: response.data.bitcoin.usd,
      ETH: response.data.ethereum.usd,
    };

    await redis.set("crypto:price", JSON.stringify(prices), "EX", 60);
    console.log("✅ Prices updated:", prices);
  } catch (err) {
    console.error("❌ Failed to fetch prices:", err.message);
  }
}

// Run every 30 seconds
setInterval(fetchAndStorePrices, 30000);

// Run once immediately at startup
fetchAndStorePrices();

module.exports = { fetchAndStorePrices };
