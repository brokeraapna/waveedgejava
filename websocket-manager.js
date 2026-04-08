const WebSocket = require("ws");
const axios = require("axios");

let ws;

async function connectWebSocket(getToken) {
  const token = await getToken();

  ws = new WebSocket("wss://api.upstox.com/v2/feed/market-data", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  ws.on("open", () => {
    console.log("✅ WebSocket Connected");

    // Subscribe to symbols
    ws.send(JSON.stringify({
      guid: "waveedge",
      method: "sub",
      data: {
        mode: "full",
        instrumentKeys: ["NSE_INDEX|Nifty 50"]
      }
    }));
  });

  ws.on("message", (data) => {
    const parsed = JSON.parse(data);
    console.log("📊 Live Data:", parsed);
  });

  ws.on("close", () => {
    console.log("⚠️ WebSocket Disconnected. Reconnecting...");
    setTimeout(() => connectWebSocket(getToken), 3000);
  });

  ws.on("error", (err) => {
    console.error("WS Error:", err.message);
  });
}

module.exports = { connectWebSocket };
