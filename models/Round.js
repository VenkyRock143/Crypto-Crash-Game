const mongoose = require("mongoose");

// Schema for a single game round
const roundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true
  },
  seed: {
    type: String,
    required: true // Used for provably fair crash algorithm
  },
  hash: {
    type: String,
    required: true // Hash of seed + roundId, shown for transparency
  },
  crashPoint: {
    type: Number,
    required: true // The multiplier at which the round crashes
  },
  bets: [
    {
      playerId: {
        type: mongoose.Types.ObjectId,
        ref: "Player",
        required: true
      },
      cryptoAmount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        enum: ["BTC", "ETH"], // Limit to supported cryptos
        required: true
      },
      usdAmount: {
        type: Number,
        required: true
      },
      cashoutMultiplier: {
        type: Number // Multiplier at which the player cashed out (if any)
      },
      won: {
        type: Boolean,
        default: false
      }
    }
  ],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
});

// Export the Round model
module.exports = mongoose.model("Round", roundSchema);
