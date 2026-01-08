# THE ORBITAL

**THE ORBITAL** is a real-time maritime intelligence platform designed to track global shipping logistics. It features a "mission-control" style dashboard with live vessel tracking, geofencing, and crisis simulation.

## 🔴 Live Demo

[Click here to view the live demo](https://theorbital-demo.web.app) _(Link will be active after deployment)_

## ✨ Features

- **Live Ship Tracking**: View vessels moving in real-time.
- **Geofencing**: Instantly jump to key locations like Rotterdam, Suez, and Panama.
- **Fleet Watchlist**: Pin and track specific vessels.
- **Crisis Mode**: Simulate emergency scenarios.
- **Observer Count**: See how many people are watching with you.

## 🚀 How to Run Locally

1.  **Clone the project**

    ```bash
    git clone https://github.com/Nedu2022/theorbital.git
    cd theorbital
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the app**
    ```bash
    npm run dev:all
    ```
    Open `http://localhost:3000` in your browser.

## 🔧 Setup Notes

You will need API keys for **Mapbox**, **AisStream**, and **Firebase** in a `.env.local` file to run this locally.

---

_Built with Next.js, Tailwind CSS, and Deck.gl_
