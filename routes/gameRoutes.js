const express = require("express");
const router = express.Router();

// Import controller methods for game actions
const { placeBet, cashOut } = require("../controllers/gameController");

router.post("/bet", placeBet);

router.post("/cashout", cashOut);

module.exports = router;
