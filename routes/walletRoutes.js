const express = require("express");
const router = express.Router();

// Controller to fetch real-time crypto prices
const { getPrices } = require("../controllers/priceController");

// Controller to fetch a player's wallet balance
const { getBalance } = require("../controllers/walletController");

/**
 * @route   GET /api/wallet/prices
 * @desc    Get current BTC and ETH prices
 * @access  Public
 */
router.get("/prices", getPrices);

/**
 * @route   GET /api/wallet/:playerId
 * @desc    Get wallet balance for a specific player (in crypto and USD)
 * @access  Public
 */
router.get("/:playerId", getBalance);

module.exports = router;
