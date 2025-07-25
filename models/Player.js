const mongoose = require("mongoose");

// Define schema for Player
const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // Makes username mandatory
    trim: true
  },
  wallets: {
    BTC: {
      type: Number,
      default: 1 // Starting balance in BTC
    },
    ETH: {
      type: Number,
      default: 1 // Starting balance in ETH
    }
  }
});

// Export the Player model
module.exports = mongoose.model("Player", playerSchema);
