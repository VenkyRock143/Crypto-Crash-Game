const { generateSeed, getHash, getCrashPoint } = require("./crashAlgorithm");
const Round = require("../models/Round");
const Player = require("../models/Player");
const Transaction = require("../models/Transaction");
const crypto = require("crypto");

let currentRound = null;
let currentMultiplier = 1.0;
let bets = [];
let interval = null;

let isRunning = false;
let stopRequested = false;

function startGameLoop(io) {
  if (isRunning) return;
  isRunning = true;
  stopRequested = false;
  runCrashRound(io);
}

function stopGameLoop() {
  stopRequested = true;
}

async function runCrashRound(io) {
  if (stopRequested) {
    console.log("🛑 Game stopped due to no connected users.");
    isRunning = false;
    return;
  }

  const roundId = Date.now().toString();
  const seed = generateSeed();
  const hash = getHash(seed, roundId);
  const crashPoint = getCrashPoint(hash);

  currentRound = { roundId, seed, hash, crashPoint };
  bets = [];
  currentMultiplier = 1.0;

  console.log(`\n🕹️ New Round Started | Crash at: ${crashPoint}`);
  io.emit("roundStart", { roundId, crashPoint: "??", multiplier: 1.0 });

  const startTime = Date.now();

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

    if (currentMultiplier >= crashPoint) {
      clearInterval(interval);
      console.log(`💥 CRASHED at ${currentMultiplier}`);
      io.emit("crash", { crashPoint, roundId, seed, hash });

      for (const bet of bets) {
        if (!bet.cashout) {
          bet.won = false;
          await Round.updateOne({ roundId }, { $push: { bets: bet } }, { upsert: true });
        }
      }

      setTimeout(() => runCrashRound(io), 3000);
    }
  }, 100);
}

function handleBet(data) {
  console.log("📥 WebSocket Bet received:", data);

  if (!currentRound || currentMultiplier >= currentRound.crashPoint - 0.1) {
    console.log("⚠️ Bet rejected: too close to crash or already crashed");
    return;
  }

  const alreadyPlaced = bets.find(
    b => b.playerId?.toString() === data.playerId?.toString() && !b.cashout
  );
  if (alreadyPlaced) {
    console.log("⚠️ Bet already placed and not cashed out");
    return;
  }

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

function handleCashout(io, socket, data) {
  console.log("👉 Received cashout request for:", data.playerId);
  console.log("📊 Current active bets:", bets.map(b => b.playerId));

  const bet = bets.find(
    b => b.playerId?.toString() === data.playerId?.toString() && !b.cashout
  );

  if (!bet) {
    console.log("❌ No active bet found for cashout");
    socket.emit("cashoutFailed", { reason: "No active bet or already cashed out" });
    return;
  }

  if (currentMultiplier >= currentRound.crashPoint) {
    console.log("⚠️ Too late! Crash already happened at:", currentRound.crashPoint);
    socket.emit("cashoutFailed", { reason: "Too late! Crash already occurred." });
    return;
  }

  bet.cashout = true;
  bet.cashoutMultiplier = currentMultiplier;
  bet.won = true;

  const winAmount = bet.cryptoAmount * currentMultiplier;
  const price = bet.price ?? 1;
  const usdAmount = winAmount * price;

  if (!bet.price) {
    console.warn(`⚠️ Missing price for player ${bet.playerId}. Defaulting to $1`);
  }

  Player.findById(bet.playerId).then(player => {
    player.wallets[bet.currency] += winAmount;

    return player.save().then(() => {
      return Transaction.create({
        playerId: bet.playerId,
        usdAmount,
        cryptoAmount: winAmount,
        currency: bet.currency,
        transactionType: "cashout",
        transactionHash: crypto.randomBytes(12).toString("hex"),
        priceAtTime: price,
      });
    }).then(() => {
      return Round.updateOne(
        { roundId: currentRound.roundId },
        { $push: { bets: bet } },
        { upsert: true }
      );
    }).then(() => {
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
    });
  }).catch(err => {
    console.error("❌ Player cashout failed:", err);
    socket.emit("cashoutFailed", { reason: "Server error during cashout" });
  });
}

module.exports = {
  startGameLoop,
  stopGameLoop,
  handleBet,
  handleCashout,
};
