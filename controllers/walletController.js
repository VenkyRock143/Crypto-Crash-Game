const Player = require("../models/Player");
const { getCryptoPrice } = require("../services/priceService");

// Get player's wallet balance in crypto and USD
exports.getBalance = async (req, res) => {
  try {
    // Fetch player using their ID
    const player = await Player.findById(req.params.playerId);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Fetch real-time prices for BTC and ETH
    const BTC = await getCryptoPrice("BTC");
    const ETH = await getCryptoPrice("ETH");

    // Respond with wallet balances in both crypto and USD
    res.json({
      BTC: {
        crypto: player.wallets.BTC,
        usd: player.wallets.BTC * BTC,
      },
      ETH: {
        crypto: player.wallets.ETH,
        usd: player.wallets.ETH * ETH,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching wallet balance:", err);
    res.status(500).json({ error: "Server error" });
  }
};
