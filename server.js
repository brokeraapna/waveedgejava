const express = require("express");
const axios = require("axios");
const fs = require("fs");
}
const app = express();
const PORT = process.env.PORT || 3000;
// ============================================================
// WaveEdge — Main Backend Server (Full Version)
// Upstox OAuth + Historical + Live + Scanner + Signals + Socket.IO
// ============================================================
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const axios      = require('axios');
const cors       = require('cors');
const querystring = require('querystring');
const fs         = require('fs');
const path       = require('path');
require('dotenv').config();

const { NIFTY50, getAllInstrumentKeys, getByKey } = require('./instruments');
const { generateSignal } = require('./indicators');
const { startPolling, stopPolling, getLiveCache } = require('./websocket-manager');

const app    = express();
const server = http.createServer(app);

// ─── CORS: Allow Vercel frontend + local dev ─────────────────
const ALLOWED_ORIGINS = [
  'https://waveedge.in',
  'https://www.waveedge.in',
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5500',
  /\.vercel\.app$/,       // All Vercel preview deployments
];
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Allow curl/Postman
    const allowed = ALLOWED_ORIGINS.some(o =>
      typeof o === 'string' ? o === origin : o instanceof RegExp ? o.test(origin) : false
    );
    cb(allowed ? null : new Error('CORS blocked'), allowed);
  },
  credentials: true,
};

const io = new Server(server, { cors: { origin: '*' } });
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve frontend (local dev)

// ─── Config ──────────────────────────────────────────────────
const CLIENT_ID     = process.env.UPSTOX_API_KEY;
const CLIENT_SECRET = process.env.UPSTOX_SECRET_KEY;
const REDIRECT_URI  = process.env.UPSTOX_REDIRECT_URI;
const TOKEN_FILE    = path.join(__dirname, 'token.json');
const SIGNAL_CACHE_FILE = path.join(__dirname, 'signals-cache.json');

// ─── Token Helpers ───────────────────────────────────────────
function saveToken(data) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ ...data, saved_at: Date.now() }));
}
function getToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_FILE));
}
function getAccessToken() {
  const t = getToken();
  return t ? t.access_token : null;
}
function authHeader() {
  return { Authorization: `Bearer ${getAccessToken()}`, Accept: 'application/json' };
}

// ─── Signal Cache ─────────────────────────────────────────────
let signalCache = { ts: 0, signals: [], running: false };

// ─────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────

// GET /api/upstox/login-url
app.get('/api/upstox/login-url', (req, res) => {
  const url = `https://api.upstox.com/v2/login/authorization/dialog?` +
    `response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=waveedge`;
  res.json({ url });
});

// GET /callback  (Upstox sends user here after login)
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing authorization code.');

  try {
    const response = await axios.post(
      'https://api.upstox.com/v2/login/authorization/token',
      querystring.stringify({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' } }
    );
    saveToken(response.data);
    console.log('✅ Token saved. Starting live feed...');
    startPolling(io);  // Auto-start live polling after login
    res.redirect(`${process.env.FRONTEND_URL || 'https://waveedge.in'}/scanner.html?connected=true`);
  } catch (err) {
    console.error('Token error:', err.response?.data);
    res.status(500).send('Auth failed: ' + JSON.stringify(err.response?.data));
  }
});

// GET /api/upstox/status
app.get('/api/upstox/status', (req, res) => {
  const token = getToken();
  if (!token) return res.json({ connected: false });
  const ageHrs = (Date.now() - token.saved_at) / 3600000;
  res.json({ connected: true, expires_in_hours: Math.max(0, 24 - ageHrs).toFixed(1) });
});

// ─────────────────────────────────────────────────────────────
// MARKET DATA ROUTES
// ─────────────────────────────────────────────────────────────

// GET /api/market/ltp?instruments=NSE_EQ|...
app.get('/api/market/ltp', async (req, res) => {
  const token = getAccessToken();
  if (!token) return res.status(401).json({ error: 'Not connected' });
  const { instruments } = req.query;
  try {
    const r = await axios.get('https://api.upstox.com/v2/market-quote/ltp', {
      params: { instrument_key: instruments || getAllInstrumentKeys() },
      headers: authHeader(),
    });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.response?.data }); }
});

// GET /api/market/live  (returns cached live prices)
app.get('/api/market/live', (req, res) => {
  const cache = getLiveCache();
  res.json({ data: cache, ts: Date.now(), count: Object.keys(cache).length });
});

// GET /api/market/historical?instrument=...&interval=day&from=2024-01-01&to=2024-12-31
app.get('/api/market/historical', async (req, res) => {
  const token = getAccessToken();
  if (!token) return res.status(401).json({ error: 'Not connected' });
  const { instrument, interval = 'day', from, to } = req.query;
  try {
    const url = `https://api.upstox.com/v2/historical-candle/${encodeURIComponent(instrument)}/${interval}/${to}/${from}`;
    const r = await axios.get(url, { headers: authHeader() });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.response?.data || e.message }); }
});

// GET /api/market/intraday?instrument=...&interval=30minute
app.get('/api/market/intraday', async (req, res) => {
  const token = getAccessToken();
  if (!token) return res.status(401).json({ error: 'Not connected' });
  const { instrument, interval = '30minute' } = req.query;
  try {
    const url = `https://api.upstox.com/v2/historical-candle/intraday/${encodeURIComponent(instrument)}/${interval}`;
    const r = await axios.get(url, { headers: authHeader() });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.response?.data || e.message }); }
});

// ─────────────────────────────────────────────────────────────
// SCANNER ROUTES
// ─────────────────────────────────────────────────────────────

// GET /api/scanner/run  (runs full Nifty50 scan — may take 30-60s on first run)
app.get('/api/scanner/run', async (req, res) => {
  const token = getAccessToken();
  if (!token) return res.status(401).json({ error: 'Not connected to Upstox' });

  // Return cached results if fresh (< 15 minutes old)
  if (signalCache.signals.length > 0 && (Date.now() - signalCache.ts) < 15 * 60 * 1000) {
    return res.json({ cached: true, age_seconds: Math.round((Date.now() - signalCache.ts) / 1000), signals: signalCache.signals });
  }

  if (signalCache.running) return res.json({ running: true, message: 'Scanner already running. Try again in 30s.' });

  signalCache.running = true;
  const signals = [];
  const today   = new Date().toISOString().slice(0, 10);
  const past200 = new Date(Date.now() - 200 * 86400000).toISOString().slice(0, 10);

  // Process in batches to avoid rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < NIFTY50.length; i += BATCH_SIZE) {
    const batch = NIFTY50.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (inst) => {
      try {
        const url = `https://api.upstox.com/v2/historical-candle/${encodeURIComponent(inst.key)}/day/${today}/${past200}`;
        const r = await axios.get(url, { headers: authHeader() });
        const candles = r.data?.data?.candles || [];
        if (candles.length < 50) return;

        const analysis = generateSignal(candles);
        const liveData = getLiveCache()[inst.key];

        signals.push({
          symbol:     inst.symbol,
          name:       inst.name,
          sector:     inst.sector,
          key:        inst.key,
          ltp:        liveData?.ltp || candles[0]?.[4],
          change:     liveData?.change || 0,
          changePct:  liveData?.changePct || 0,
          signal:     analysis.signal,
          confidence: analysis.confidence,
          score:      analysis.score,
          reasons:    analysis.reasons,
          rsi:        analysis.indicators?.rsi,
          macd:       analysis.indicators?.macd?.crossover,
          bb:         analysis.indicators?.bb?.signal,
          breakout:   analysis.indicators?.breakout?.signal,
          scannedAt:  new Date().toISOString(),
        });
      } catch (err) {
        // Skip failed instruments silently
      }
    }));
    await new Promise(r => setTimeout(r, 500)); // Rate limit pause
  }

  // Sort: BUY first, then SELL, then NEUTRAL; by confidence descending
  signals.sort((a, b) => {
    const order = { BUY: 0, SELL: 1, NEUTRAL: 2 };
    return (order[a.signal] - order[b.signal]) || (b.confidence - a.confidence);
  });

  signalCache = { ts: Date.now(), signals, running: false };
  if (fs.existsSync(path.dirname(SIGNAL_CACHE_FILE))) {
    fs.writeFileSync(SIGNAL_CACHE_FILE, JSON.stringify(signalCache));
  }

  // Broadcast new signals to all connected Socket.IO clients
  io.emit('scanner_complete', { signals, count: signals.length });

  res.json({ cached: false, signals, count: signals.length });
});

// GET /api/scanner/signals  (get last cached results)
app.get('/api/scanner/signals', (req, res) => {
  const filter = req.query.signal; // BUY, SELL, NEUTRAL
  let signals  = signalCache.signals;
  if (filter) signals = signals.filter(s => s.signal === filter.toUpperCase());
  res.json({ signals, ts: signalCache.ts, count: signals.length });
});

// ─────────────────────────────────────────────────────────────
// INSTRUMENTS ROUTE
// ─────────────────────────────────────────────────────────────
app.get('/api/instruments', (req, res) => {
  res.json({ instruments: NIFTY50, count: NIFTY50.length });
});

// ─────────────────────────────────────────────────────────────
// HEALTH / KEEP-ALIVE (UptimeRobot pings this every 5 mins)
// Prevents Render free tier from sleeping during market hours
// ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const token = getToken();
  res.json({
    status: 'ok',
    connected: !!token,
    uptime: process.uptime().toFixed(0) + 's',
    ts: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🌐 Client connected:', socket.id);

  // Send current live cache immediately on connect
  const cache = getLiveCache();
  if (Object.keys(cache).length > 0) socket.emit('ltp_update', cache);

  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🌊 WaveEdge Upstox Backend`);
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📡 Frontend:          http://localhost:${PORT}/scanner.html`);
  console.log(`🔗 Redirect URI:      ${REDIRECT_URI}\n`);

  // Auto-resume polling if token exists and is fresh
  const token = getToken();
  if (token && (Date.now() - token.saved_at) < 23 * 3600 * 1000) {
    console.log('🔄 Token found — starting live feed automatically...');
    startPolling(io);
  } else {
    console.log('⚠️  No active token. Open the site and click "Connect Upstox" to begin.');
  }
});
function saveToken(data) {
  const tokenData = {
    ...data,
    created_at: Date.now()
  };
  fs.writeFileSync("token.json", JSON.stringify(tokenData, null, 2));
}

function loadToken() {
  if (!fs.existsSync("token.json")) return null;
  return JSON.parse(fs.readFileSync("token.json"));
}
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("Auth code missing ❌");
  }

  try {
    await exchangeCodeForToken(code);
    res.send("Connected ✅ Token Saved");
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

app.get("/test", async (req, res) => {
  try {
    const token = await getValidAccessToken();
    res.send("Token working ✅");
  } catch (err) {
    res.send(err.message);
  }
});
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
