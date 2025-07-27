// Required Modules
const { generateSeed, getHash, getCrashPoint } = require("./crashAlgorithm");
const Round = require("../models/Round");
const Player = require("../models/Player");
const Transaction = require("../models/Transaction");
const crypto = require("crypto");

// Internal Game State
let currentRound = null;
let currentMultiplier = 1.0;
let bets = [];
let interval = null;

// Flags to control game loop
let isRunning = false;
let stopRequested = false;

/**
 * Starts the game loop when the first client connects.
 */
function startGameLoop(io) {
  if (isRunning) return; // already running
  isRunning = true;
  stopRequested = false;
  runCrashRound(io);
}

/**
 * Stops the game loop when all clients disconnect.
 */
function stopGameLoop() {
  stopRequested = true;
}

/**
 * Runs a single round of the Crash game.
 * This function calls itself recursively after each round (if not stopped).
 */
async function runCrashRound(io) {
  if (stopRequested) {
    console.log("🛑 Game stopped. No active users.");
    isRunning = false;
    return;
  }

  // Generate round metadata
  const roundId = Date.now().toString();
  const seed = generateSeed();
  const hash = getHash(seed, roundId);
  const crashPoint = getCrashPoint(hash);

  // Set up round state
  currentRound = { roundId, seed, hash, crashPoint };
  bets = [];
  currentMultiplier = 1.0;

  console.log(`\n🕹️ New Round Started | Crash at: ${crashPoint}`);
  io.emit("roundStart", { roundId, crashPoint: "??", multiplier: 1.0 });

  const startTime = Date.now();

  // Begin real-time multiplier increase
  interval = setInterval(async () => {
    if (stopRequested) {
      clearInterval(interval);
      isRunning = false;
      console.log("🛑 Game loop interrupted mid-round.");
      return;
    }

    const elapsed = (Date.now() - startTime) / 1000;
    currentMultiplier = Math.round((1 + elapsed * 0.05) * 100) / 100;

    io.emit("multiplier", { multiplier: currentMultiplier });

    // If crash point reached, stop the round
    if (currentMultiplier >= crashPoint) {
      clearInterval(interval);
      console.log(`💥 CRASHED at ${currentMultiplier}`);
      io.emit("crash", { crashPoint, roundId, seed, hash });

      // Mark all uncashed bets as lost
      for (const bet of bets) {
        if (!bet.cashout) {
          bet.won = false;
          await Round.updateOne({ roundId }, { $push: { bets: bet } }, { upsert: true });
        }
      }

      // Start next round after 3 seconds
      setTimeout(() => runCrashRound(io), 3000);
    }
  }, 100); // update every 100ms
}

/**
 * Handle a new bet from a player.
 */
function handleBet(data) {
  console.log("📥 Received WebSocket bet:", data);

  // Reject if round isn't valid or crash is too close
  if (!currentRound || currentMultiplier >= currentRound.crashPoint - 0.1) {
    console.log("⚠️ Bet rejected: too close to crash or already crashed");
    return;
  }

  // Prevent duplicate bets from the same player
  const alreadyPlaced = bets.find(
    b => b.playerId?.toString() === data.playerId?.toString() && !b.cashout
  );
  if (alreadyPlaced) {
    console.log("⚠️ Bet already placed and not cashed out");
    return;
  }

  // Store bet
  const newBet = {
    playerId: data.playerId,
    cryptoAmount: data.cryptoAmount,
    currency: data.currency,
    usdAmount: data.usdAmount,
    price: data.price,
    cashout: false,
  };

  bets.push(newBet);
  console.log("✅ Bet stored:", newBet);
}

/**
 * Handle a cashout request from the client.
 */
function handleCashout(io, socket, data) {
  console.log("👉 Cashout request for:", data.playerId);
  console.log("📊 Active bets:", bets.map(b => b.playerId));

  const bet = bets.find(
    b => b.playerId?.toString() === data.playerId?.toString() && !b.cashout
  );

  if (!bet) {
    console.log("❌ No active bet found for this player.");
    socket.emit("cashoutFailed", { reason: "No active bet or already cashed out" });
    return;
  }

  if (currentMultiplier >= currentRound.crashPoint) {
    console.log("⚠️ Too late to cash out. Crash already happened.");
    socket.emit("cashoutFailed", { reason: "Too late! Crash already occurred." });
    return;
  }

  // Mark as cashed out
  bet.cashout = true;
  bet.cashoutMultiplier = currentMultiplier;
  bet.won = true;

  const winAmount = bet.cryptoAmount * currentMultiplier;
  const price = bet.price ?? 1;
  const usdAmount = winAmount * price;

  if (!bet.price) {
    console.warn(`⚠️ Missing price for ${bet.playerId}, defaulting to $1`);
  }

  // Update wallet and transaction logs
  Player.findById(bet.playerId)
    .then(player => {
      player.wallets[bet.currency] += winAmount;
      return player.save();
    })
    .then(() => {
      return Transaction.create({
        playerId: bet.playerId,
        usdAmount,
        cryptoAmount: winAmount,
        currency: bet.currency,
        transactionType: "cashout",
        transactionHash: crypto.randomBytes(12).toString("hex"),
        priceAtTime: price,
      });
    })
    .then(() => {
      return Round.updateOne(
        { roundId: currentRound.roundId },
        { $push: { bets: bet } },
        { upsert: true }
      );
    })
    .then(() => {
      socket.emit("cashoutSuccess", {
        usd: usdAmount,
        crypto: winAmount,
        multiplier: currentMultiplier,
      });

      io.emit("playerCashout", {
        playerId: bet.playerId,
        multiplier: currentMultiplier,
        usd: usdAmount,
      });
    })
    .catch(err => {
      console.error("❌ Cashout failed:", err);
      socket.emit("cashoutFailed", { reason: "Server error during cashout" });
    });
}

// Export all functions
module.exports = {
  startGameLoop,
  stopGameLoop,
  handleBet,
  handleCashout,
};
