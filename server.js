const express = require("express");
const axios = require("axios");
const fs = require("fs");
const qs = require("qs");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 10000;

// 🔐 ENV VARIABLES
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// 📁 TOKEN FILE
const TOKEN_FILE = "token.json";

// =========================
// 🔹 SAVE TOKEN
// =========================
function saveToken(data) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2));
  console.log("✅ Token saved");
}

// =========================
// 🔹 GET TOKEN
// =========================
function getToken() {
  if (!fs.existsSync(TOKEN_FILE)) {
    console.log("❌ No token found");
    return null;
  }
  const data = JSON.parse(fs.readFileSync(TOKEN_FILE));
  return data.access_token;
}

// =========================
// 🔹 LOGIN ROUTE
// =========================
app.get("/login", (req, res) => {
  const loginUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${API_KEY}&redirect_uri=${REDIRECT_URI}`;
  res.redirect(loginUrl);
});

// =========================
// 🔹 CALLBACK (FIXED)
// =========================
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("❌ Auth code missing");
  }

  try {
    const response = await axios.post(
      "https://api.upstox.com/v2/login/authorization/token",
      qs.stringify({
        code: code,
        client_id: API_KEY,
        client_secret: API_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    saveToken(response.data);

    res.send("✅ Connected Successfully!");
  } catch (err) {
    console.error("❌ TOKEN ERROR:", err.response?.data || err.message);
    res.send(JSON.stringify(err.response?.data || err.message));
  }
});

// =========================
// 🔹 WEBSOCKET CONNECT
// =========================
let ws;

async function connectWebSocket() {
  const token = getToken();

  if (!token) {
    console.log("❌ Token Error: Login required");
    return;
  }

  ws = new WebSocket("wss://api.upstox.com/v2/feed/market-data", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  ws.on("open", () => {
    console.log("✅ WebSocket Connected");

    // Example subscribe
    ws.send(JSON.stringify({
      guid: "test",
      method: "sub",
      data: {
        mode: "full",
        instrumentKeys: ["NSE_INDEX|Nifty 50"]
      }
    }));
  });

  ws.on("message", (data) => {
    console.log("📊 Data:", data.toString());
  });

  ws.on("close", () => {
    console.log("⚠️ WS Closed. Reconnecting...");
    setTimeout(connectWebSocket, 5000);
  });

  ws.on("error", (err) => {
    console.log("❌ WS Error:", err.message);
  });
}

// =========================
// 🔹 AUTO START WS
// =========================
setTimeout(connectWebSocket, 5000);

// =========================
// 🔹 SERVER START
// =========================
app.get("/", (req, res) => {
  res.send("🚀 WaveEdge Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("API_KEY:", API_KEY);
console.log("REDIRECT_URI:", REDIRECT_URI);
