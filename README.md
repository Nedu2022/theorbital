# The Orbital

![Status](https://img.shields.io/badge/Status-Live-green) ![Version](https://img.shields.io/badge/Version-1.1.0-orange)

**The Orbital** is a next-generation Maritime Domain Awareness (MDA) platform. It provides real-time tracking, visualization, and analysis of global shipping logistics through a high-fidelity "mission control" interface.

## 🚀 Key Features

- **Real-Time AIS Tracking**: Live ingestion of Automatic Identification System (AIS) data streams.
- **Geolocation-Based Local Scan**: Uses your device's location to show nearby maritime traffic.
- **Tactical Watchlist**: Persistent monitoring of priority vessels.
- **Crisis Simulation**: Built-in modules for simulating piracy or distress events.
- **Operator Metrics**: Live view counters to track active dashboard observers.

## 🛠 Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (React/TypeScript)
- **Visualization**: [Deck.gl](https://deck.gl/) + [Mapbox GL](https://www.mapbox.com/)
- **Data Layer**: Custom WebSocket Proxy for secure AIS streaming
- **Hosting**: [Vercel](https://vercel.com/) (Recommended)

## 🚀 Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nedu2022/theorbital)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new).
2. Import this repository from GitHub.
3. Add the following **Environment Variables** in Vercel's dashboard:

| Variable                        | Description               |
| ------------------------------- | ------------------------- |
| `NEXT_PUBLIC_MAPBOX_TOKEN`      | Your Mapbox Access Token  |
| `NEXT_PUBLIC_AISSTREAM_API_KEY` | Your AisStream.io API Key |

4. Click **Deploy**.

> **Note**: The WebSocket proxy (`server/ws-proxy.js`) is currently for local development. For full production live data, deploy the proxy to a separate backend service (e.g., Railway, Render, or Cloud Run) and set `NEXT_PUBLIC_WS_PROXY_URL` to its URL.

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start the WebSocket proxy (in a separate terminal)
node server/ws-proxy.js

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📱 Mobile Support

The Orbital is fully responsive with an optimized mobile experience:

- Collapsible control panel
- Touch-friendly map interactions
- Geolocation-based "Local Scan" mode

---

_© 2026 The Orbital. Built by nnedu._
