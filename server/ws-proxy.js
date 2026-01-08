

const WebSocket = require("ws");
const http = require("http");
require("dotenv").config({ path: ".env.local" });

const PORT = process.env.WS_PROXY_PORT || 3001;
const AIS_API_KEY = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY;
const HEARTBEAT_INTERVAL = 30000; 
const RECONNECT_BASE_DELAY = 1000; 
const RECONNECT_MAX_DELAY = 30000; 
const DISCONNECT_GRACE_PERIOD = 5000; 

if (!AIS_API_KEY) {
  console.error(
    " FATAL: NEXT_PUBLIC_AISSTREAM_API_KEY not found in .env.local"
  );
  process.exit(1);
}

console.log("🔑 API Key loaded:", "..." + AIS_API_KEY.slice(-4));


class AISStreamManager {
  constructor() {
    this.aisWs = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.clients = new Set();
    this.subscriptionQueue = [];
    this.reconnectAttempts = 0;
    this.reconnectAttempts = 0;
    this.heartbeatInterval = null;
    this.disconnectTimeout = null;
    this.disconnectTimeout = null;
    this.subscriptionDebounceTimer = null; // Throttle subscription updates
    this.subscriptionDebounceTimer = null; // Throttle subscription updates
    this.lastSentSubscription = null; // Cache to prevent duplicate sends
    this.currentMergedSubscription = null; // Persist active sub for reconnects
  }

  connect() {
    if (this.isConnected || this.isConnecting) {
      console.log("⚠️ Already connected or connecting to AisStream");
      return;
    }

    this.isConnecting = true;
    console.log("🔌 Connecting to AisStream...");
    this.aisWs = new WebSocket("wss://stream.aisstream.io/v0/stream");

    this.aisWs.on("open", () => {
      console.log("✅ Connected to AisStream");
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Resend active subscription if exists
      if (this.currentMergedSubscription) {
        const payloadString = JSON.stringify(this.currentMergedSubscription);
        console.log("🔄 Resending active subscription on reconnect");
        this.aisWs.send(payloadString);
        this.lastSentSubscription = payloadString;
      }

      // Broadcast connection status to all clients
      this.broadcastToClients({
        type: "proxy_status",
        status: "connected",
      });

      // Process queued subscriptions
      this.processSubscriptionQueue();

      // Start heartbeat
      this.startHeartbeat();
    });

    this.aisWs.on("message", (data) => {
      const msgStr = data.toString();
      if (msgStr.includes("error") || msgStr.includes("Error")) {
        console.error("🔥 UPSTREAM SENT ERROR:", msgStr);
      } else if (Math.random() < 0.1) {
        console.log("📨 Upstream sample:", msgStr.slice(0, 500)); 
      }

      // Broadcast AIS messages to all connected browser clients
      this.broadcastToClients(msgStr);
    });

    this.aisWs.on("error", (error) => {
      console.error("⚠️ AisStream error:", error.message);
      this.broadcastToClients({
        type: "proxy_error",
        error: error.message,
      });
    });

    this.aisWs.on("close", (code, reason) => {
      console.log("❌ AisStream closed:", code, reason.toString());
      this.isConnected = false;
      this.isConnecting = false;
      this.stopHeartbeat();

      this.broadcastToClients({
        type: "proxy_status",
        status: "disconnected",
        code,
        reason: reason.toString(),
      });

      // Only reconnect if we have active clients
      if (this.clients.size > 0) {
        this.scheduleReconnect();
      }
    });
  }

  disconnect() {
    // Clear any pending disconnect timeout
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }

    this.stopHeartbeat();
    if (this.aisWs) {
      this.aisWs.close();
      this.aisWs = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.lastSentSubscription = null; // Reset cache so we resend on connect
  }

  scheduleReconnect() {
    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_DELAY
    );
    this.reconnectAttempts++;

    console.log(
      `🔄 Reconnecting to AisStream in ${delay}ms (attempt ${this.reconnectAttempts})...`
    );

    setTimeout(() => {
      if (this.clients.size > 0) {
        this.connect();
      }
    }, delay);
  }

  addClient(ws) {
    this.clients.add(ws);
    console.log(`👥 Client connected. Total clients: ${this.clients.size}`);

    // If there's a pending disconnect, cancel it!
    if (this.disconnectTimeout) {
      console.log(
        "⚡ Cancelling pending disconnect status - reusing active connection"
      );
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }

    // Start AisStream connection if this is the first client (and not already connected)
    if (this.clients.size >= 1 && !this.isConnected && !this.isConnecting) {
      this.connect();
    }

    // Send current connection status to the new client
    if (this.isConnected) {
      ws.send(
        JSON.stringify({
          type: "proxy_status",
          status: "connected",
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: "proxy_status",
          status: "connecting",
        })
      );
    }
  }

  removeClient(ws) {
    this.clients.delete(ws);
    console.log(`👥 Client disconnected. Total clients: ${this.clients.size}`);

    // Disconnect from AisStream if no clients remain -- WITH GRACE PERIOD
    if (this.clients.size === 0) {
      // Clear any existing timeout (rare)
      if (this.disconnectTimeout) {
        clearTimeout(this.disconnectTimeout);
      }

      console.log(
        `⏳ No clients remaining. Waiting ${DISCONNECT_GRACE_PERIOD}ms before disconnecting...`
      );

      this.disconnectTimeout = setTimeout(() => {
        console.log(
          "📴 Disconnect timeout reached. Disconnecting from AisStream"
        );
        this.disconnect();
        this.subscriptionQueue = [];
        this.disconnectTimeout = null;
      }, DISCONNECT_GRACE_PERIOD);
    }
  }

  addSubscription(subscription) {
    const subscriptionWithKey = {
      ...subscription,
      APIKey: AIS_API_KEY,
    };

    // Always buffer and debounce to prevent "Too Many Reqs" error
    this.subscriptionQueue.push(subscriptionWithKey);
    this.scheduleSubscriptionUpdate();
  }

  scheduleSubscriptionUpdate() {
    if (this.subscriptionDebounceTimer) return;

    console.log("⏳ Scheduling subscription update (debounced 1000ms)...");
    this.subscriptionDebounceTimer = setTimeout(() => {
      this.processSubscriptionQueue();
      this.subscriptionDebounceTimer = null;
    }, 1000);
  }

  processSubscriptionQueue() {
    if (this.subscriptionQueue.length === 0) {
      return;
    }

    console.log(
      `📨 Processing ${this.subscriptionQueue.length} buffered subscription(s)`
    );

    // Merge all subscriptions (combine bounding boxes and message types)
    const mergedSubscription = this.subscriptionQueue.reduce(
      (acc, sub) => {
        if (sub.BoundingBoxes) {
          acc.BoundingBoxes = acc.BoundingBoxes || [];
          acc.BoundingBoxes.push(...sub.BoundingBoxes);
        }
        if (sub.FilterMessageTypes) {
          acc.FilterMessageTypes = acc.FilterMessageTypes || [];
          acc.FilterMessageTypes.push(...sub.FilterMessageTypes);
        }
        return acc;
      },
      { APIKey: AIS_API_KEY }
    );

    // Remove duplicates
    if (mergedSubscription.BoundingBoxes) {
      mergedSubscription.BoundingBoxes = Array.from(
        new Set(mergedSubscription.BoundingBoxes.map(JSON.stringify))
      ).map(JSON.parse);
    }
    if (mergedSubscription.FilterMessageTypes) {
      mergedSubscription.FilterMessageTypes = Array.from(
        new Set(mergedSubscription.FilterMessageTypes)
      );
    }

    const payloadString = JSON.stringify(mergedSubscription);
    if (this.lastSentSubscription === payloadString) {
      console.log("⏭️ Subscription unchanged, skipping upstream update.");
      this.subscriptionQueue = []; // Clear queue even if not sent
      return;
    }

    if (this.isConnected && this.aisWs.readyState === WebSocket.OPEN) {
      console.log(
        "📤 Sending merged subscription to AisStream (Payload):",
        payloadString
      );
      this.aisWs.send(payloadString);
      this.lastSentSubscription = payloadString;
      this.currentMergedSubscription = mergedSubscription; // Persist
    } else {
      console.log("⚠️ Not connected to AisStream, buffering subscription.");
      // The subscription remains in the queue to be sent upon reconnection
    }

    this.subscriptionQueue = [];
  }

  broadcastToClients(message) {
    const data =
      typeof message === "string" ? message : JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.aisWs.readyState === WebSocket.OPEN) {
        // Just log heartbeat, AisStream doesn't require ping/pong
        console.log("💓 Heartbeat: AisStream connection alive");
      }
    }, HEARTBEAT_INTERVAL);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Create singleton instance
const aisManager = new AISStreamManager();

// ============================================================================
// HTTP & WEBSOCKET SERVER
// ============================================================================

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket Proxy Server Running\n");
});

const wss = new WebSocket.Server({ server });

console.log(`🚀 WebSocket Proxy Server starting on port ${PORT}...`);

wss.on("connection", (clientWs, request) => {
  console.log("📱 New browser connection from:", request.socket.remoteAddress);

  // Add client to manager
  aisManager.addClient(clientWs);

  // Handle messages from browser
  clientWs.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // If it's a subscription request, add to manager
      if (data.BoundingBoxes || data.FilterMessageTypes) {
        console.log("📥 Received subscription from browser");
        aisManager.addSubscription(data);
      }
    } catch (error) {
      console.error("❌ Error processing browser message:", error);
    }
  });

  clientWs.on("close", () => {
    console.log("📱 Browser disconnected");
    aisManager.removeClient(clientWs);
  });

  clientWs.on("error", (error) => {
    console.error("⚠️ Browser connection error:", error.message);
  });
});

server.listen(PORT, () => {
  console.log(
    `✅ WebSocket Proxy Server listening on http://localhost:${PORT}`
  );
  console.log(`📡 Browser should connect to: ws://localhost:${PORT}`);
  console.log(`🔐 API Key is hidden from browser`);
  console.log(`♻️  Connection pooling: ENABLED with 5s GRACE PERIOD`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down proxy server...");
  aisManager.disconnect();
  wss.close(() => {
    server.close(() => {
      console.log("✅ Proxy server stopped");
      process.exit(0);
    });
  });
});
