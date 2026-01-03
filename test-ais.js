// Test script - reads key from .env.local
require("dotenv").config({ path: ".env.local" });
const WebSocket = require("ws");

const API_KEY = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY;

if (!API_KEY) {
  console.error("❌ No API key found in .env.local");
  process.exit(1);
}

console.log("🔑 Testing API Key:", "..." + API_KEY.slice(-4));
console.log("🔌 Connecting to AisStream...");

const ws = new WebSocket("wss://stream.aisstream.io/v0/stream");

ws.on("open", () => {
  console.log("✅ WebSocket CONNECTED!");

  const subscription = {
    APIKey: API_KEY,
    BoundingBoxes: [
      [
        [51.5, 3.0],
        [52.5, 5.0],
      ],
    ],
    FilterMessageTypes: ["PositionReport"],
  };

  console.log("📤 Sending subscription...");
  ws.send(JSON.stringify(subscription));
});

ws.on("message", (data) => {
  const msg = JSON.parse(data);

  if (msg.error) {
    console.error("❌ ERROR FROM AISSTREAM:", msg.error);
    process.exit(1);
  }

  console.log("✅ SUCCESS! Received ship data:");
  console.log("   Type:", msg.MessageType);
  console.log("   MMSI:", msg.MetaData?.MMSI);
  console.log("   Ship:", msg.MetaData?.ShipName);
  console.log("   Position:", msg.MetaData?.latitude, msg.MetaData?.longitude);

  // Exit after first successful message
  setTimeout(() => {
    console.log("✅ Test PASSED - API key is valid and working!");
    ws.close();
    process.exit(0);
  }, 1000);
});

ws.on("close", (code, reason) => {
  console.log(`❌ WebSocket CLOSED: ${code} ${reason || "No reason"}`);
  process.exit(1);
});

ws.on("error", (error) => {
  console.error("⚠️ WebSocket ERROR:", error.message);
});

setTimeout(() => {
  console.log("⏱️ Timeout - no messages received in 15 seconds");
  process.exit(1);
}, 15000);
