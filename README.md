# THE ORBITAL

**THE ORBITAL** is a sophisticated, real-time maritime intelligence platform designed to track global shipping logistics. With a "mission-control" aesthetic, it provides live tracking of vessels, geofencing capabilities, and crisis simulation tools.

![Orbital Dashboard Demo](https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070&auto=format&fit=crop)
_(Note: Replace with actual screenshot)_

## 🚀 Features

- **Real-Time Ship Tracking**: Live AIS data integration via WebSocket proxy.
- **Mission Control Interface**: A high-contrast, data-dense UI designed for clarity and aesthetics.
- **Geofencing & Zones**: Quick navigation to key maritime chokepoints (Rotterdam, Suez, Panama, etc.).
- **Fleet Watchlist**: Pin important vessels to your dashboard for quick access.
- **Crisis Simulation**: Simulate piracy events and emergency scenarios.
- **Real-Time View Counter**: See how many other operators are currently viewing the system.

## 🛠️ Technology Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (React, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Mapping**: [Deck.gl](https://deck.gl/) & [Mapbox GL](https://www.mapbox.com/)
- **Data**: AIS stream via local WebSocket proxy (`ws-proxy.js`)
- **Backend/Deployment**: Firebase (Hosting & Firestore)

## 📦 Installation & Setup

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Nedu2022/theorbital.git
    cd theorbital
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root directory and add your keys:

    ```env
    NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
    NEXT_PUBLIC_AISSTREAM_API_KEY=your_aisstream_key

    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server**
    You need to run both the Next.js app and the WebSocket proxy:

    ```bash
    npm run dev:all
    ```

    _Or run them separately in two terminals:_

    ```bash
    npm run proxy   # Terminal 1
    npm run dev     # Terminal 2
    ```

5.  **Open Dashboard**
    Visit `http://localhost:3000` to view the application.

## 🚢 Data Source

This application proxies real-time AIS data from [AisStream.io](https://aisstream.io/). You will need a free API key from their service.

## 📝 License

This project is licensed under the MIT License.
