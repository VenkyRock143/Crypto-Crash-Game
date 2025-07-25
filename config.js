// config.js
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/crypto-crash",
  CRYPTO_API: process.env.COINGECKO_API || "https://api.coingecko.com/api/v3/simple/price",
};
