const { getCryptoPrice } = require("../services/priceService");

// Returns the current prices for BTC and ETH
exports.getPrices = async (req, res) => {
  try {
    // Fetch latest prices from the price service
    const BTC = await getCryptoPrice("BTC");
    const ETH = await getCryptoPrice("ETH");

    // Respond with the current prices
    res.json({ BTC, ETH });
  } catch (error) {
    console.error("❌ Failed to fetch prices:", error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
};
