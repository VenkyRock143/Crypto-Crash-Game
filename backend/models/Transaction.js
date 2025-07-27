const mongoose = require("mongoose");

// Schema for logging a player's transaction (bet or cashout)
const transactionSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Types.ObjectId,
    ref: "Player",
    required: true
  },
  usdAmount: {
    type: Number,
    required: true
  },
  cryptoAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ["BTC", "ETH"], // Restrict to supported currencies
    required: true
  },
  transactionType: {
    type: String,
    enum: ["bet", "cashout"], // Better to restrict valid types
    required: true
  },
  transactionHash: {
    type: String,
    required: true // Mock hash, for simulation
  },
  priceAtTime: {
    type: Number, // USD price per crypto at time of transaction
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Export the Transaction model
module.exports = mongoose.model("Transaction", transactionSchema);
