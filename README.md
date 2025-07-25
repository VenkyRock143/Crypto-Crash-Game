# Crypto Crash Game

A real-time multiplayer crypto crash betting game, built with Node.js, Express, Socket.IO, and MongoDB. Players place bets in BTC or ETH using USD, and try to cash out before the multiplier crashes.

---

## 🚀 Project Overview

This game simulates a crypto-style crash game where:

* A round starts with a multiplier beginning at 1.00x.
* The multiplier increases rapidly.
* Players try to cash out before the game crashes.
* If the multiplier crashes before they cash out, they lose the bet.

---

## 📁 Tech Stack

* **Backend:** Node.js, Express
* **WebSocket:** Socket.IO
* **Database:** MongoDB + Mongoose
* **API:** CoinGecko (crypto price fetch)
* **Frontend (for testing):** Plain HTML + JS + Socket.IO client

---

## 📂 Folder Structure

```
```bash
📁 BACKEND
├── 📁 controllers
│   ├── gameController.js         # Handles bet placement and cashout (REST)
│   ├── priceController.js        # Handles price fetching via CoinGecko
│   └── walletController.js       # Returns player's wallet in crypto + USD
│
├── 📁 models
│   ├── Player.js                 # Mongoose schema for player wallets
│   ├── Round.js                  # Mongoose schema for game rounds
│   └── Transaction.js            # Mongoose schema for transactions (bets/cashouts)
│
├── 📁 public
│   └── test-client.html          # Frontend test UI for interacting with backend + WebSocket
│
├── 📁 routes
│   ├── gameRoutes.js             # Routes for /api/game (place bet, cashout)
│   └── walletRoutes.js           # Routes for /api/wallet (get balance, price)
│
├── 📁 scripts
│   └── seed.js                   # MongoDB script to seed 3 sample players
│
├── 📁 services
│   ├── crashAlgorithm.js         # Provably fair logic: seed, hash, crash point
│   ├── priceService.js           # Fetch and cache live prices (BTC, ETH)
│   ├── socketService.js          # Handles in-game WebSocket bet/cashout logic
│   └── walletService.js          # Reusable wallet actions: deduct/add balance
│
├── 📁 websocket
│   └── socket.js                 # Initializes and manages WebSocket lifecycle
│
├── .env                          # Environment config (Mongo URI, CoinGecko URL)
├── .gitignore                   # Ignores node_modules and .env from versioning
├── config.js                    # Optional config file for fallback env vars
├── Crypto-Crash-Game.postman_collection.json   # Postman collection to test API endpoints
├── package.json
├── package-lock.json
├── README.md
└── server.js                    # Entry point: Express app, MongoDB setup, routes, socket.io
```

---

## 🛠️ Setup Instructions

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/crypto-crash-game.git
cd crypto-crash-game
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create `.env` file in the root directory:**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
COINGECKO_API=https://api.coingecko.com/api/v3/simple/price
```

4. **Seed database with sample players:**

```bash
node scripts/seedPlayers.js
```

5. **Start the server:**

```bash
node server.js
```

---

## 📦 API Endpoints

### `POST /api/game/bet`

Place a bet

```json
{
  "playerId": "<player_id>",
  "usdAmount": 10,
  "currency": "BTC"
}
```

**Returns:**

```json
{
  "message": "Bet placed",
  "cryptoAmount": 0.000086,
  "price": 115203,
  "txHash": "abc123xyz"
}
```

### `GET /api/wallet/:playerId`

Get wallet balances in crypto and USD

```json
{
  "BTC": { "crypto": 0.5, "usd": 15000 },
  "ETH": { "crypto": 2.0, "usd": 6000 }
}
```

---

## 🔌 WebSocket Events

### `place_bet`

Send this after placing REST bet

```js
socket.emit("place_bet", {
  playerId,
  usdAmount,
  currency,
  cryptoAmount,
  price
});
```

### `cashout`

```js
socket.emit("cashout", { playerId });
```

### Events received from server:

* `roundStart` — new round started
* `multiplier` — updated multiplier
* `crash` — round crashed
* `playerCashout` — a player cashed out
* `cashoutSuccess` — your cashout succeeded
* `cashoutFailed` — your cashout failed

---

## 🎲 Provably Fair Crash Algorithm

Each round is determined fairly using:

* A **server seed** (random 16-byte hex)
* A **round ID** (timestamp)
* SHA256 Hash of `seed + roundId`

The crash point is calculated via a provably fair method:

```js
const crash = Math.floor((100 / (1 - rand))) / 100;
```

Clamped between `1.01x` and `20.00x`.

This ensures:

* Randomness from server
* Reproducible crash values
* No manipulation after seed is generated

---

## 💱 USD to Crypto Conversion

* Uses **CoinGecko API** to fetch live prices every 10 seconds
* Players input **USD**, backend calculates crypto amount

Example:

```js
cryptoAmount = usdAmount / price
```

---

## 🎮 Game Logic

* Every few seconds, a new round starts.
* Server broadcasts multiplier updates.
* Multiplier increases every 100ms.
* If multiplier reaches crash point, game ends.
* If player cashes out before crash, they win based on multiplier.

---

## 🧪 Postman Collection

Import the file `CryptoCrash.postman_collection.json` into Postman.
Includes:

* Place Bet (POST)
* Get Wallet Balance (GET)

---


---

## 👨‍💻 Author

Venky (Full-Stack Developer)

---

## ✅ Status

Working version with:

* Complete REST API
* WebSocket integration
* Fair round logic
* Database storage of rounds and transactions
* Test client and Postman collection

Feel free to fork and build more advanced versions (e.g., leaderboards, authentication, frontend frameworks).

---
