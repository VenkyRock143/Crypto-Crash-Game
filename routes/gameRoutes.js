const express = require("express");
const router = express.Router();

// Import controller methods for game actions
const { placeBet, cashOut } = require("../controllers/gameController");

/**
 * @route   POST /api/game/bet
 * @desc    Place a new bet in USD (converted to crypto)
 * @access  Public (simulated environment)
 */
router.post("/bet", placeBet);

/**
 * @route   POST /api/game/cashout
 * @desc    Trigger a cashout (handled via WebSocket in practice)
 * @access  Public
 */
router.post("/cashout", cashOut);

module.exports = router;
