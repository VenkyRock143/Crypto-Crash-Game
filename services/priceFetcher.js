const axios = require("axios");
const Redis = require("ioredis");
const dotenv = require("dotenv");

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
  tls: {}
});

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";

async function fetchAndStorePrices() {
  try {
    const response = await axios.get(COINGECKO_URL);
    const prices = {
      BTC: response.data.bitcoin.usd,
      ETH: response.data.ethereum.usd,
    };
    await redis.set("crypto:price", JSON.stringify(prices), "EX", 60); // expires in 60 sec
    console.log("✅ Prices updated:", prices);
  } catch (err) {
    console.error("❌ Failed to fetch prices:", err.message);
  }
}

// Every 30 seconds
setInterval(fetchAndStorePrices, 30000);
fetchAndStorePrices(); // immediate fetch at startup

module.exports = { fetchAndStorePrices };
