# The Orbital

![Status](https://img.shields.io/badge/Status-Live-green) ![Security](https://img.shields.io/badge/Security-Standard-blue) ![Version](https://img.shields.io/badge/Version-1.0.0-orange)

**The Orbital** is a next-generation Maritime Domain Awareness (MDA) platform. It provides real-time tracking, visualization, and analysis of global shipping logistics through a high-fidelity "mission control" interface.

Designed for readability and speed, The Orbital allows operators to monitor key maritime chokepoints (e.g., Rotterdam, Suez, Panama) and track specific high-value assets with minimal latency.

## 🚀 Key Features

- **Real-Time AIS Tracking**: Live ingestion of Automatic Identification System (AIS) data streams.
- **Geospatial Intelligence**: Instant filtering of vessels by strategic zones (Geofencing).
- **Tactical Watchlist**: Persistent monitoring of priority vessels.
- **Crisis Simulation**: Built-in modules for simulating piracy or distress events for training purposes.
- **Operator Metrics**: Live view counters to track active dashboard observers.

## 🛠 Technical Architecture

This project is built on a modern, scalable stack designed for performance and maintainability:

- **Frontend**: [Next.js 15](https://nextjs.org/) (React/TypeScript) - Utilizing static export for ultra-fast edge delivery.
- **Visualization**: [Deck.gl](https://deck.gl/) + [Mapbox GL](https://www.mapbox.com/) - Handling high-volume vector data rendering.
- **Data Layer**: Custom WebSocket Proxy - Ensuring secure, non-blocking data streaming from AIS providers.
- **Infrastructure**: Firebase - Providing secure hosting and real-time database capabilities.

## 🛡 Security & Configuration

Security is paramount. No sensitive credentials are hardcoded in this repository. All API keys and access tokens are managed via environment variables.

### Environment Setup

To run this application locally, you must configure a `.env.local` file in the root directory. This file is git-ignored to prevent accidental exposure of credentials.

**Required Variables:**

```env
# Mapbox Configuration (Visualization)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.YOUR_TOKEN_HERE

# AIS Stream Configuration (Data Source)
NEXT_PUBLIC_AISSTREAM_API_KEY=YOUR_API_KEY_HERE

# Firebase Configuration (Deployment & Analytics)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 📦 Deployment Guide

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)

### Build & Deploy

The application is configured for static export to ensure maximum availability and security.

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Build Production Artifact**:

    ```bash
    npm run build
    ```

3.  **Deploy to Firebase Hosting**:
    ```bash
    firebase deploy --only hosting
    ```

---

_© 2026 The Orbital. Internal Use Only._
