const Player = require("../models/Player");

/**
 * Deduct a crypto amount from a player's wallet.
 *
 * @param {string} playerId
 * @param {number} cryptoAmount
 * @param {string} currency - 'BTC' or 'ETH'
 * @returns {Promise<Player>}
 */
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

/**
 * Add a crypto amount to a player's wallet.
 *
 * @param {string} playerId
 * @param {number} cryptoAmount
 * @param {string} currency
 * @returns {Promise<Player>}
 */
async function addToWallet(playerId, cryptoAmount, currency) {
  const player = await Player.findById(playerId);
  if (!player) throw new Error("Player not found");

  player.wallets[currency] += cryptoAmount;
  await player.save();

  return player;
}

/**
 * Fetch the full wallet balance for a player.
 *
 * @param {string} playerId
 * @returns {Promise<Object>} - Wallet object with crypto balances
 */
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
