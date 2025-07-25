const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Player = require("../models/Player");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB using the MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("📦 Connected to MongoDB. Seeding players...");

    // Clear existing players
    await Player.deleteMany({});

    // Create sample player records
    await Player.create([
      { username: "player1" },
      { username: "player2" },
      { username: "player3" }
    ]);

    console.log("✅ Players seeded successfully.");
    process.exit(); // Exit the script
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  });
