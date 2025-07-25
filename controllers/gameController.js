const Player = require("../models/Player");
const Transaction = require("../models/Transaction");
const { getCryptoPrice } = require("../services/priceService");
const { deductFromWallet } = require("../services/walletService");
const crypto = require("crypto");

// Handles placing a new bet from a player
exports.placeBet = async (req, res) => {
  try {
    const { playerId, usdAmount, currency } = req.body;

    // Look up the player in the database
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Fetch the latest crypto price (e.g., BTC/USD or ETH/USD)
    const price = await getCryptoPrice(currency);

    // Convert the USD bet into equivalent crypto amount
    const cryptoAmount = usdAmount / price;

    // Check if the player has enough balance in the selected crypto
    if (player.wallets[currency] < cryptoAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct the crypto amount from the player's wallet
    player.wallets[currency] -= cryptoAmount;
    await player.save();

    // Also update via wallet service for consistency
    await deductFromWallet(playerId, cryptoAmount, currency);

    // Create a fake transaction hash (simulate blockchain TX)
    const txHash = crypto.randomBytes(12).toString("hex");

    // Log the transaction in the database
    await Transaction.create({
      playerId,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: "bet",
      transactionHash: txHash,
      priceAtTime: price,
    });

    // Respond with bet info so frontend can sync
    res.json({
      message: "Bet placed",
      cryptoAmount,
      price,
      txHash,
    });

  } catch (err) {
    console.error("💥 Bet error:", err);

    if (err.response?.status === 429) {
      return res.status(503).json({
        error: "Rate limit exceeded. Please try again after a short while.",
      });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// Manual REST cashout endpoint is disabled (handled via WebSocket only)
exports.cashOut = async (req, res) => {
  res.status(501).json({ error: "Use WebSocket for cashout" });
};
