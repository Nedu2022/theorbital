"use client";

import dynamic from "next/dynamic";

// Dynamically import map with no SSR to avoid 'window is not defined'
const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-black flex items-center justify-center text-cyan-400 font-mono animate-pulse">
      ESTABLISHING UPLINK...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <MapComponent />
    </main>
  );
}
