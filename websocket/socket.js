const { handleCashout, handleBet, runCrashRound } = require("../services/socketService");

/**
Initializes all WebSocket event listeners and starts the crash game loop.
@param {SocketIO.Server} io - The Socket.IO server instance
 */
function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔌 Client connected");

    // Listen for client requesting to cash out
    socket.on("cashout", (data) => {
      handleCashout(io, socket, data);
    });

    // Listen for a new bet placement from client
    socket.on("place_bet", (data) => {
      handleBet(data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });

  // Start the repeating crash game loop
  runCrashRound(io);
}

module.exports = { initSocket };
