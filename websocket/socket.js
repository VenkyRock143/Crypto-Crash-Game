const {
  handleCashout,
  handleBet,
  startGameLoop,
  stopGameLoop,
} = require("../services/socketService");

let activeConnections = 0;

function initSocket(io) {
  io.on("connection", (socket) => {
    activeConnections++;
    console.log("✅ Client connected. Total:", activeConnections);

    if (activeConnections === 1) {
      startGameLoop(io);  // 🔥 Start game only when first client connects
    }

    socket.on("place_bet", (data) => {
      handleBet(data);
    });

    socket.on("cashout", (data) => {
      handleCashout(io, socket, data);
    });

    socket.on("disconnect", () => {
      activeConnections--;
      console.log("❌ Client disconnected. Total:", activeConnections);

      if (activeConnections === 0) {
        stopGameLoop();  // 🧯 Stop game when no clients are online
      }
    });
  });
}

module.exports = { initSocket };
