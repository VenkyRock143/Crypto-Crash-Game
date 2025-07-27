const express = require("express");
const router = express.Router();

// Controller to fetch real-time crypto prices
const { getPrices } = require("../controllers/priceController");

// Controller to fetch a player's wallet balance
const { getBalance } = require("../controllers/walletController");

router.get("/prices", getPrices);

router.get("/:playerId", getBalance);

module.exports = router;
