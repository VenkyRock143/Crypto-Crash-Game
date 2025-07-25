// Import game logic handlers
const {
  handleCashout,
  handleBet,
  startGameLoop,
  stopGameLoop,
} = require("../services/socketService");

// Track how many clients are connected
let activeConnections = 0;

/**
 * Initializes WebSocket (Socket.IO) connections and listeners.
 * @param {Server} io - The Socket.IO server instance.
 */
function initSocket(io) {
  io.on("connection", (socket) => {
    activeConnections++;
    console.log("✅ Client connected. Total:", activeConnections);

    // If this is the first client, start the game loop
    if (activeConnections === 1) {
      startGameLoop(io);
    }

    // Handle incoming "place_bet" events
    socket.on("place_bet", (data) => {
      handleBet(data);
    });

    // Handle "cashout" events
    socket.on("cashout", (data) => {
      handleCashout(io, socket, data);
    });

    // Handle when a client disconnects
    socket.on("disconnect", () => {
      activeConnections--;
      console.log("❌ Client disconnected. Total:", activeConnections);

      // If no players are left, stop the game loop
      if (activeConnections === 0) {
        stopGameLoop();
      }
    });
  });
}

// Export the initializer so it can be used in server.js
module.exports = { initSocket };
