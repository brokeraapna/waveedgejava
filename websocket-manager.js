const WebSocket = require("ws");

let ws;

async function connectWebSocket(getToken) {
  try {
    const token = await getToken();

    ws = new WebSocket("wss://api.upstox.com/v2/feed/market-data", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    ws.on("open", () => {
      console.log("✅ WebSocket Connected");

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
      console.log("📊 Live Data:", data.toString());
    });

    ws.on("close", () => {
      console.log("⚠️ WebSocket Disconnected. Reconnecting...");
      setTimeout(() => connectWebSocket(getToken), 3000);
    });

    ws.on("error", (err) => {
      console.error("WS Error:", err.message);
    });

  } catch (err) {
    console.error("Token Error:", err.message);
    setTimeout(() => connectWebSocket(getToken), 5000);
  }
}

module.exports = { connectWebSocket };
