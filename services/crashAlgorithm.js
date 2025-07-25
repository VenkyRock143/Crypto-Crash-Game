const crypto = require("crypto");

/**
 * Generates a random 16-byte hexadecimal seed.
 * Used as the base for hashing in each round.
 */
function generateSeed() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Creates a SHA256 hash based on the seed and round ID.
 * Ensures the crash point can be verified externally.
 * 
 * @param {string} seed - The random seed for the round
 * @param {string} roundId - Unique round identifier
 * @returns {string} - SHA256 hash (hex string)
 */
function getHash(seed, roundId) {
  return crypto.createHash("sha256").update(seed + roundId).digest("hex");
}

/**
 * Determines the crash point multiplier using a provably fair method.
 * - Uses the first 13 characters of the hash to generate a pseudo-random number.
 * - Simulates an exponential distribution where lower multipliers are more common.
 * - Guarantees:
 *    • Minimum crash at 1.01x
 *    • Maximum capped at 20x
 * 
 * @param {string} hash - The hash generated from seed + roundId
 * @returns {number} - Crash multiplier (e.g., 1.5, 3.2)
 */
function getCrashPoint(hash) {
  const h = parseInt(hash.slice(0, 13), 16);     // First 13 hex chars = 52 bits
  const rand = h / Math.pow(2, 52);              // Convert to float between 0 and 1

  if (rand === 0) return 1.01;

  const crash = Math.floor((100 / (1 - rand))) / 100;  // Exponential model
  return Math.max(1.01, Math.min(crash, 20));          // Clamp between 1.01 and 20
}

module.exports = {
  generateSeed,
  getHash,
  getCrashPoint,
};
