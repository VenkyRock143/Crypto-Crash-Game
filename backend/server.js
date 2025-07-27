const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");
require("./services/priceFetcher"); // start price updater


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

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Crypto Crash Game Backend</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          padding: 30px;
          max-width: 800px;
          margin: auto;
        }
        h1 {
          color: #4CAF50;
        }
        code {
          background: #eee;
          padding: 2px 6px;
          border-radius: 4px;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
        }
        a {
          color: #007BFF;
        }
      </style>
    </head>
    <body>
      <h1>✨ Crypto Crash Game Backend</h1>
      <p>The server is up and running!</p>

      <h3>Available Routes:</h3>
      <ul>
        <li><code>GET /api/wallet/&lt;playerId&gt;</code> - View wallet balance</li>
        <li><code>POST /api/game/bet</code> - Place a new bet</li>
      </ul>

      <h3>WebSocket Events:</h3>
      <ul>
        <li><code>place_bet</code> - Send bet via WebSocket</li>
        <li><code>cashout</code> - Send cashout request</li>
        <li><code>multiplier</code>, <code>roundStart</code>, <code>crash</code>, <code>playerCashout</code> - Receive game updates</li>
      </ul>

      <h3>Test Clients:</h3>
      <p>👉 Localhost: <code><a href="/test-client.html" target="_blank">localhost:5000/test-client.html </a></code></p>
      <p>👉 Online Demo: <code><a href="https://venky-crypto-crash-game.netlify.app/">Render Deployment</a></code></p>
    </html>
  `);
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
