"use client";

import { Map, MapProvider, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useShipData } from "@/hooks/useShipData";
import { useGeofencing } from "@/hooks/useGeofencing";
import { useUserLocation } from "@/hooks/useUserLocation";
import ControlPanel from "../dashboard/ControlPanel";
import MapController from "./MapController";
import DeckGLOverlay from "./DeckGLOverlay";
import MapLegend from "./MapLegend";
import { useEffect, useState } from "react";
import { MergedShip } from "@/hooks/useShipData";
import OnboardingModal from "../ui/OnboardingModal";
import { getCountryFromDestination } from "@/utils/countryMapper";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "#00ff9d";
    case 1:
      return "#fbbf24";
    case 5:
      return "#3b82f6";
    default:
      return "#94a3b8";
  }
};

const getStatusLabel = (status: number) => {
  switch (status) {
    case 0:
      return "MOVING";
    case 1:
      return "STOPPED";
    case 5:
      return "DOCKED";
    default:
      return "UNKNOWN";
  }
};

const ATTRIBUTION =
  '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a>';

export default function MapComponent() {
  const [viewMode, setViewMode] = useState<"global" | "local">("global");
  const {
    location: userLocation,
    loading: locationLoading,
    requestLocation,
    getBbox,
  } = useUserLocation();

  // Use user's location bbox for local mode, undefined for global
  const currentBBox: [number, number, number, number] | undefined =
    viewMode === "local" ? getBbox() : undefined;

  const { ships, connectionStatus, latency, errorCode, isSimulation } =
    useShipData(currentBBox);

  const [mounted, setMounted] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>("global");
  const [crisisActive, setCrisisActive] = useState(false);
  const [selectedShip, setSelectedShip] = useState<MergedShip | null>(null);
  const [watchlist, setWatchlist] = useState<MergedShip[]>([]);

  const addToWatchlist = (ship: MergedShip) => {
    setWatchlist((prev) => {
      if (prev.find((s) => s.mmsi === ship.mmsi)) return prev;
      return [...prev, ship];
    });
  };

  const removeFromWatchlist = (mmsi: string) => {
    setWatchlist((prev) => prev.filter((s) => s.mmsi !== mmsi));
  };

  const isInWatchlist = (mmsi: string) => {
    return watchlist.some((s) => s.mmsi === mmsi);
  };

  const { zones, impactedShips, riskLevel } = useGeofencing(
    ships,
    crisisActive
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleViewModeChange = (mode: "global" | "local") => {
    setViewMode(mode);
    if (mode === "global") {
      setActiveZone("global");
    } else {
      // Request user location when switching to local mode
      requestLocation();
      setActiveZone("local");
    }
  };

  const handleCrisisToggle = () => {
    setCrisisActive(!crisisActive);
    if (!crisisActive) {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      );
      audio.volume = 0.5;
      audio.play().catch((e) => console.log("Audio autoplay blocked", e));
      handleViewModeChange("global");
    }
  };

  if (!mounted)
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">
        INITIALIZING SATELLITE LINK...
      </div>
    );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-red-500 font-mono flex-col p-4 text-center">
        <div className="text-2xl font-bold mb-2">MISSING MAPBOX TOKEN</div>
        <div className="text-gray-400 text-sm max-w-md">
          Please add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to your{" "}
          <code>.env.local</code> file to enable the secure map link.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-screen bg-black overflow-hidden ${
        crisisActive ? "animate-pulse ring-4 ring-inset ring-red-600" : ""
      }`}
    >
      {crisisActive && (
        <div className="absolute inset-0 z-[2000] pointer-events-none flex items-center justify-center bg-red-900/10">
          <div className="bg-red-600 text-black font-black text-4xl md:text-6xl px-8 md:px-12 py-4 md:py-6 transform -rotate-12 border-4 border-black shadow-2xl animate-bounce text-center flex flex-col items-center">
            <span>{riskLevel} ALERT</span>
            <span className="text-lg md:text-xl font-mono mt-2 bg-black text-red-500 px-2">
              {impactedShips.length} VESSELS IN DANGER ZONE
            </span>
          </div>
        </div>
      )}

      <OnboardingModal />

      <div className="absolute top-4 left-4 z-[1000] pointer-events-none transition-all duration-300">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
            <h1 className="text-xl md:text-2xl font-black text-white font-mono tracking-wider">
              ORBITAL
            </h1>
          </div>
          <div className="hidden md:block h-6 w-px bg-gray-600" />
          <span className="hidden md:block text-xs text-gray-400 font-mono tracking-widest">
            MARITIME COMMAND
          </span>
        </div>

        <div className="flex gap-2 mt-3 pointer-events-auto">
          <button
            onClick={() => handleViewModeChange("local")}
            className={`px-4 py-1.5 text-xs font-mono tracking-wider border transition-all ${
              viewMode === "local"
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                : "bg-black/50 border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            LOCAL SCAN
          </button>
          <button
            onClick={() => handleViewModeChange("global")}
            className={`px-4 py-1.5 text-xs font-mono tracking-wider border transition-all ${
              viewMode === "global"
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                : "bg-black/50 border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            GLOBAL ORBIT
          </button>
        </div>
      </div>

      <ControlPanel
        onZoneChange={setActiveZone}
        onCrisisTrigger={handleCrisisToggle}
        crisisActive={crisisActive}
        selectedShip={selectedShip}
        watchlist={watchlist}
        onAddToWatchlist={addToWatchlist}
        onRemoveFromWatchlist={removeFromWatchlist}
      />

      <div className="absolute bottom-4 md:bottom-6 right-3 md:right-6 z-[1000] pointer-events-none">
        <div className="bg-black/90 border border-gray-700 px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-2 md:gap-3 font-mono text-[10px] md:text-xs">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? isSimulation
                    ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"
                    : "bg-green-500 shadow-[0_0_8px_rgba(0,255,0,0.8)] animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <span className="text-gray-400">
              {connectionStatus === "connected"
                ? isSimulation
                  ? "SIMULATION"
                  : "LIVE"
                : "OFFLINE"}
            </span>
          </div>
          {ships.length > 0 && (
            <>
              <div className="h-4 w-px bg-gray-700" />
              <span className="text-cyan-400">{ships.length} ships</span>
            </>
          )}
          {connectionStatus === "connected" && (
            <>
              <div className="hidden md:block h-4 w-px bg-gray-700" />
              <span className="hidden md:block text-gray-500">
                {latency.toFixed(0)}ms
              </span>
            </>
          )}
        </div>
      </div>

      <MapLegend />

      <MapProvider>
        <Map
          initialViewState={{
            longitude: 0,
            latitude: 20,
            zoom: 1.5,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
          onClick={() => setSelectedShip(null)}
          reuseMaps
        >
          <MapController targetZone={activeZone} userLocation={userLocation} />

          <DeckGLOverlay
            zones={zones}
            showZones={crisisActive}
            ships={ships}
            onSelectShip={setSelectedShip}
          />

          {selectedShip && (
            <Popup
              longitude={selectedShip.lng}
              latitude={selectedShip.lat}
              offset={[0, -20]}
              closeButton={false}
              closeOnClick={false}
              anchor="bottom"
              className="military-popup z-[2000] max-w-[300px]"
            >
              <div className="bg-black border border-cyan-500/50 p-4 min-w-[250px] font-mono shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                <div className="flex justify-between items-start mb-3 border-b border-gray-700 pb-2">
                  <div>
                    <h3 className="font-bold text-cyan-400 text-sm tracking-wider">
                      {selectedShip.name || "UNKNOWN VESSEL"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      MMSI: {selectedShip.mmsi}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-1 border"
                    style={{
                      borderColor: getStatusColor(selectedShip.status),
                      color: getStatusColor(selectedShip.status),
                    }}
                  >
                    {getStatusLabel(selectedShip.status)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">DESTINATION</span>
                    <span className="text-white">
                      {selectedShip.destination || "CLASSIFIED"}
                    </span>
                  </div>
                  {getCountryFromDestination(selectedShip.destination) && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">REGION</span>
                      <span className="text-cyan-300">
                        {
                          getCountryFromDestination(selectedShip.destination)
                            ?.flag
                        }{" "}
                        {
                          getCountryFromDestination(selectedShip.destination)
                            ?.country
                        }
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">SPEED</span>
                    <span className="text-white">
                      {selectedShip.sog.toFixed(1)} KTS
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">HEADING</span>
                    <span className="text-white">{selectedShip.heading}°</span>
                  </div>
                  {selectedShip.eta && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ETA</span>
                      <span className="text-white">
                        {selectedShip.eta.split(" ")[0]}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInWatchlist(selectedShip.mmsi)) {
                      removeFromWatchlist(selectedShip.mmsi);
                    } else {
                      addToWatchlist(selectedShip);
                    }
                  }}
                  className={`w-full mt-4 py-2 text-xs font-bold tracking-wider border transition-all ${
                    isInWatchlist(selectedShip.mmsi)
                      ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                      : "bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30"
                  }`}
                >
                  {isInWatchlist(selectedShip.mmsi)
                    ? "− REMOVE FROM WATCHLIST"
                    : "+ ADD TO WATCHLIST"}
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </MapProvider>
    </div>
  );
}
