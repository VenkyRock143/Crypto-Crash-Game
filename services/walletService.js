const Player = require("../models/Player");

async function deductFromWallet(playerId, cryptoAmount, currency) {
  const player = await Player.findById(playerId);
  if (!player) throw new Error("Player not found");

  if (player.wallets[currency] < cryptoAmount) {
    throw new Error("Insufficient balance");
  }

  player.wallets[currency] -= cryptoAmount;
  await player.save();
  return player;
}

async function addToWallet(playerId, cryptoAmount, currency) {
  const player = await Player.findById(playerId);
  if (!player) throw new Error("Player not found");

  player.wallets[currency] += cryptoAmount;
  await player.save();
  return player;
}

async function getWalletBalance(playerId) {
  const player = await Player.findById(playerId);
  if (!player) throw new Error("Player not found");

  return player.wallets;
}

module.exports = {
  deductFromWallet,
  addToWallet,
  getWalletBalance,
};

