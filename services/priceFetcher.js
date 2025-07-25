const axios = require("axios");
const Redis = require("ioredis");
const dotenv = require("dotenv");

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
});

const CMC_API_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
const headers = {
  "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
};

async function fetchAndStorePrices() {
  try {
    console.log("📡 Fetching BTC and ETH prices from CoinMarketCap...");

    const response = await axios.get(CMC_API_URL, {
      headers,
      params: {
        symbol: "BTC,ETH",
        convert: "USD",
      },
    });

    const prices = {
      BTC: response.data.data.BTC.quote.USD.price,
      ETH: response.data.data.ETH.quote.USD.price,
    };

    await redis.set("crypto:price", JSON.stringify(prices), "EX", 60);
    console.log("✅ Prices updated and cached:", prices);
  } catch (err) {
    console.error("❌ Failed to fetch prices:", err.response?.status || err.message);
    if (err.response?.data) {
      console.error("📨 Response:", JSON.stringify(err.response.data));
    }
  }
}

fetchAndStorePrices();
setInterval(fetchAndStorePrices, 30000);

module.exports = { fetchAndStorePrices };
