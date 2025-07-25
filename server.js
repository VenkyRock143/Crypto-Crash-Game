const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");

const { initSocket } = require("./websocket/socket");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Apply middleware
app.use(cors());
app.use(express.json());

// Serve static frontend assets (like test-client.html)
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/game", require("./routes/gameRoutes"));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Start WebSocket logic
initSocket(io);

// Start HTTP server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
