"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-black flex items-center justify-center text-cyan-400 font-mono animate-pulse tracking-widest">
      ESTABLISHING SATELLITE UPLINK...
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
