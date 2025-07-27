# Crypto Crash Game

A real-time multiplayer crypto crash betting game, built with Node.js, Express, Socket.IO, and MongoDB. Players place bets in BTC or ETH using USD, and try to cash out before the multiplier crashes.

---

**Live Demo (backend):** [Crypto-Crash-Game](https://crypto-crash-game-as1x.onrender.com/)
---

**Live Demo (frontend):** [Crypto-Crash-Game](https://venky-crypto-crash-game.netlify.app/)

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
* **Frontend:**React, Socket.IO client
* **WebSocket:** Socket.IO
* **Database:** MongoDB + Mongoose
* **API:** CoinMarketCap (crypto price fetch)


---

## 📂 Folder Structure

```
Crypto-Crash-Game/
├── backend
│   ├── controllers/
│   │   ├── gameController.js
│   │   ├── priceController.js
│   │   └── walletController.js
│   ├── models/
│   │   ├── Player.js
│   │   ├── Round.js
│   │   └── Transaction.js
│   ├── node_modules/
│   ├── public/
│   │   └── test-client.html
│   ├── routes/
│   │   ├── gameRoutes.js
│   │   └── walletRoutes.js
│   ├── scripts/
│   │   └── seed.js
│   ├── services/
│   │   ├── crashAlgorithm.js
│   │   ├── priceFetcher.js
│   │   ├── priceService.js
│   │   ├── socketService.js
│   │   └── walletService.js
│   ├── websocket/
│   │   └── socket.js
│   ├── .env
│   ├── .gitignore
│   ├── Crypto-Crash-Game.postman_collection.json
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── .gitignore
│   ├── package-lock.json
│   └── package.json
├── README.md
```

---

## 🛠️ Setup Instructions

1. **Clone the repository:**

```bash
git clone https://github.com/VenkyRock143/Crypto-Crash-Game.git
cd Crypto-Crash-Game
```

2. **Backend**

1.**Install dependencies:**

```bash
cd backend
```
```bash
npm install
```

2. **Create `.env` file in the root directory:**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CMC_API_KEY=your_coinmarketcap_api_key_here
REDIS_URL=redis://default:<password>@<host>:<port>
```

3. **Seed database with sample players:**

```bash
node scripts/seed.js
```

4. **Start the server:**

```bash
node server.js
```
2. **Frontend**

1.**Install dependencies:**

```bash
cd frontend
```
```bash
npm install
```
2. **Start development server locally:**
```bash
npm start
```
3.**Build for production (for Netlify):**

```bash
npm run build
```


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
const crashPoint = Math.max(1.01, Math.min(20, Math.floor((100 / (1 - random)) / 100)));
```

Clamped between `1.01x` and `20.00x`.

This ensures:

* Randomness from server
* Reproducible crash values
* No manipulation after seed is generated

---

## 💱 USD to Crypto Conversion

* Uses **CoinMarketCap** to fetch live prices every 10 seconds
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

Import the file `Crypto-Crash-Game.postman_collection.json` into Postman.
Includes:

* Place Bet (POST)
* Get Wallet Balance (GET)

---


---

## 👨‍💻 Author

Balusani Venkatesh (Full-Stack Developer)

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
