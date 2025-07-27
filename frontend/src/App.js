import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

export default function App() {
  const [playerId, setPlayerId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [output, setOutput] = useState('');
  const logRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('https://crypto-crash-game-as1x.onrender.com', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => appendLog('✅ Connected to server'));
    socket.on('disconnect', () => appendLog('❌ Disconnected from server'));

    socket.on('roundStart', () => appendLog('🎮 New round started'));
    socket.on('multiplier', data => appendLog(`📈 Multiplier: ${data.multiplier}`));
    socket.on('crash', data => appendLog(`💥 Crashed at: ${data.crashPoint}`));
    socket.on('playerCashout', data => appendLog(`💸 Player cashed out at: ${data.multiplier}`));
    socket.on('cashoutSuccess', data => appendLog(`✅ YOU cashed out: $${data.usd}`));
    socket.on('cashoutFailed', data => appendLog(`❌ Cashout failed: ${data.reason}`));

    return () => socket.disconnect();
  }, []);

  const appendLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => `${prev}\n[${timestamp}] ${message}`);
    setTimeout(() => {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  };

  const placeBet = async () => {
    if (!playerId || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid Player ID and USD amount.");
      return;
    }

    try {
      const res = await fetch('https://crypto-crash-game-mqs3.onrender.com/api/game/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, usdAmount: amount, currency })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Unexpected server error');
      }

      const data = await res.json();

      appendLog(`🟢 REST Bet placed: $${amount} in ${currency} (${data.cryptoAmount})`);

      socketRef.current.emit('place_bet', {
        playerId,
        usdAmount: amount,
        currency,
        cryptoAmount: data.cryptoAmount,
        price: data.price
      });

      appendLog('📤 Sent WebSocket bet event');

    } catch (err) {
      appendLog('❌ Bet failed: ' + err.message);
    }
  };

  const cashout = () => {
    if (!playerId) {
      alert("Please enter your Player ID to cash out.");
      return;
    }

    socketRef.current.emit('cashout', { playerId });
    appendLog("📤 Sent cashout request");
  };

  return (
    <div className="app-container">
      <h1>Crypto Crash Game</h1>

      <div className="form-group">
        <label>Player ID:</label>
        <input
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          placeholder="Enter your Player ID"
        />
      </div>

      <div className="form-group">
        <label>USD Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10"
        />
      </div>

      <div className="form-group">
        <label>Currency:</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
        </select>
      </div>

      <div className="button-group">
        <button onClick={placeBet}>🎰 Place Bet</button>
        <button onClick={cashout}>🤑 Cashout</button>
      </div>

      <div className="log-output" ref={logRef}>
        <pre>{output.trim()}</pre>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="https://crypto-crash-game-mqs3.onrender.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: 'none',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '8px',
            display: 'inline-block',
          }}
        >
          🌐 Visit Backend API
        </a>
      </div>


    </div>
  );
}
