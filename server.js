const express = require("express");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const { connectWebSocket } = require("./websocket-manager");

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.UPSTOX_API_KEY;
const API_SECRET = process.env.UPSTOX_API_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

/*
=============================
TOKEN STORAGE
=============================
*/

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

/*
=============================
OAUTH ROUTES
=============================
*/

app.get("/login", (req, res) => {
  const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${API_KEY}&redirect_uri=${REDIRECT_URI}`;
  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.send("❌ Auth code missing");

  try {
    const response = await axios.post(
      "https://api.upstox.com/v2/login/authorization/token",
      {
        code,
        client_id: API_KEY,
        client_secret: API_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    saveToken(response.data);
    res.send("✅ Connected Successfully!");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("❌ Token exchange failed");
  }
});

/*
=============================
AUTO TOKEN REFRESH
=============================
*/

async function refreshAccessToken(refresh_token) {
  const response = await axios.post(
    "https://api.upstox.com/v2/login/refresh/token",
    { refresh_token },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
}

async function getValidAccessToken() {
  let token = loadToken();
  if (!token) throw new Error("No token found. Login required.");

  const now = Date.now();
  const expiry = token.expires_in * 1000;

  if (now - token.created_at > expiry - 60000) {
    console.log("⚠️ Token expired, refreshing...");
    token = await refreshAccessToken(token.refresh_token);
    saveToken(token);
  }

  return token.access_token;
}

async function authHeader() {
  const access_token = await getValidAccessToken();
  return { Authorization: `Bearer ${access_token}` };
}

/*
=============================
TEST API
=============================
*/

app.get("/profile", async (req, res) => {
  try {
    const headers = await authHeader();
    const response = await axios.get(
      "https://api.upstox.com/v2/user/profile",
      { headers }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("❌ API failed");
  }
});

/*
=============================
SERVER START
=============================
*/

app.get("/", (req, res) => {
  res.send("🚀 WaveEdge Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
=============================
START WEBSOCKET
=============================
*/

connectWebSocket(getValidAccessToken);
