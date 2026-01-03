"use client";

import { Map, MapProvider, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useShipData } from "@/hooks/useShipData";
import { useGeofencing } from "@/hooks/useGeofencing";
import ControlPanel from "../dashboard/ControlPanel";
import MapController from "./MapController";
import DeckGLOverlay from "./DeckGLOverlay";
import MapLegend from "./MapLegend";
import { useEffect, useState } from "react";
import { MergedShip } from "@/hooks/useShipData";
import { useLanguage } from "@/components/providers/LanguageContext";
import OnboardingModal from "../ui/OnboardingModal";

// Token should be in .env.local
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Helper for status color (duplicate of logic in overlay, but needed for popup UI)
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

const ATTRIBUTION =
  '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a>';

export default function MapComponent() {
  /* View Mode & BBox Logic */
  const [viewMode, setViewMode] = useState<"global" | "local">("global");

  // Default to Rotterdam (busy port)
  const ROTTERDAM_BBOX: [number, number, number, number] = [
    51.5, 3.0, 52.5, 5.0,
  ];

  // Logic:
  // If global -> undefined (hook handles this as global request)
  // If local -> use Rotterdam fallback
  const currentBBox: [number, number, number, number] | undefined =
    viewMode === "global" ? undefined : ROTTERDAM_BBOX;

  const { ships, connectionStatus, latency, errorCode } =
    useShipData(currentBBox);

  const [mounted, setMounted] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>("global"); // Default to global zone
  const [crisisActive, setCrisisActive] = useState(false);
  const [selectedShip, setSelectedShip] = useState<MergedShip | null>(null);

  // Geo-Fencing & Crisis Logic
  const { zones, impactedShips, riskLevel } = useGeofencing(
    ships,
    crisisActive
  );

  const { t, direction, toggleLanguage, language } = useLanguage();

  // RTL/LTR Position Classes
  const leftPanelClass = direction === "rtl" ? "right-4" : "left-4";
  const rightPanelClass =
    direction === "rtl" ? "left-4 md:left-6" : "right-4 md:right-6";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync ViewMode with Map Controller
  const handleViewModeChange = (mode: "global" | "local") => {
    setViewMode(mode);
    if (mode === "global") {
      setActiveZone("global");
    } else {
      setActiveZone("rotterdam");
    }
  };

  const handleCrisisToggle = () => {
    setCrisisActive(!crisisActive);
    if (!crisisActive) {
      // Play clean alert sound (mock)
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      );
      audio.volume = 0.5;
      audio.play().catch((e) => console.log("Audio autoplay blocked", e));

      // Auto-switch to global view to see the crisis zones (Red Sea is far)
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
      {/* Crisis Overlay */}
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

      {/* HUD Overlay - Top Left/Right */}
      <div
        className={`absolute top-4 ${leftPanelClass} z-[1000] pointer-events-none transition-all duration-300`}
      >
        <div className="flex items-center space-x-4 pointer-events-auto">
          <h1 className="text-2xl md:text-4xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-600 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            {t("orbital")}
          </h1>
          <button
            onClick={toggleLanguage}
            className="text-[10px] font-bold border border-gray-700 bg-black/50 text-gray-300 px-2 py-1 rounded hover:border-neon-cyan hover:text-neon-cyan transition-colors"
          >
            {language === "en" ? "AR" : "EN"}
          </button>
        </div>

        <div className="text-[10px] md:text-xs font-mono text-neon-cyan/70 tracking-widest mt-1">
          {t("global_maritime_logistics")}
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2 mt-4 pointer-events-auto">
          <button
            onClick={() => handleViewModeChange("local")}
            className={`px-3 py-1 text-[10px] font-bold border ${
              viewMode === "local"
                ? "bg-neon-cyan/20 border-neon-cyan text-white shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                : "border-gray-800 text-gray-500 hover:border-gray-600"
            }`}
          >
            {t("local_scan")}
          </button>
          <button
            onClick={() => handleViewModeChange("global")}
            className={`px-3 py-1 text-[10px] font-bold border ${
              viewMode === "global"
                ? "bg-neon-cyan/20 border-neon-cyan text-white shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                : "border-gray-800 text-gray-500 hover:border-gray-600"
            }`}
          >
            {t("global_orbit")}
          </button>
        </div>
      </div>
      {/* Control Panel (Interactive) */}
      <ControlPanel
        onZoneChange={setActiveZone}
        onCrisisTrigger={handleCrisisToggle}
        crisisActive={crisisActive}
        selectedShip={selectedShip}
      />
      {/* Connection Monitor - Bottom Right */}
      <div className="absolute bottom-20 md:bottom-6 right-4 md:right-6 z-[1000] bg-black/80 backdrop-blur border border-gray-800 p-2 md:p-3 rounded-sm pointer-events-none">
        <div className="flex flex-col space-y-1 font-mono text-[10px] md:text-xs">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500"
              }`}
            ></div>
            <span
              className={
                connectionStatus === "connected"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {connectionStatus === "connected" ? "LIVE" : "OFF"}
            </span>
          </div>
          <div className="flex justify-between text-gray-400 space-x-4">
            <span>PING:</span>
            <span>{latency}ms</span>
          </div>
          <div className="flex justify-between text-gray-400 space-x-4">
            <span>SHIPS:</span>
            <span>{ships.length}</span>
          </div>
        </div>
      </div>
      {/* Map Legend */}
      <MapLegend />
      <MapProvider>
        <Map
          initialViewState={{
            longitude: 0, // Global center
            latitude: 20, // Slightly north to show more land
            zoom: 1.5, // Zoomed out
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
          onClick={() => setSelectedShip(null)} // Click map to deselect
          reuseMaps
        >
          <MapController targetZone={activeZone} />

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
              className="military-popup z-[2000] max-w-[280px]"
            >
              <div className="bg-black/90 border border-neon-cyan/50 backdrop-blur-md p-3 min-w-[200px] shadow-[0_0_15px_rgba(0,243,255,0.2)] rounded-sm text-left">
                <div className="flex justify-between items-start border-b border-gray-800 pb-2 mb-2">
                  <div className="overflow-hidden">
                    <h3 className="font-mono text-neon-cyan font-bold text-sm leading-tight text-white truncate max-w-[120px]">
                      {selectedShip.name || selectedShip.mmsi}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider">
                      {selectedShip.mmsi}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div
                      className="text-[10px] font-bold font-mono px-1 py-0.5 border"
                      style={{
                        color: getStatusColor(selectedShip.status),
                        borderColor: getStatusColor(selectedShip.status),
                      }}
                    >
                      {selectedShip.status === 0
                        ? "UND"
                        : selectedShip.status === 1
                        ? "ANC"
                        : "MOR"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">TYP:</span>
                    <span className="truncate max-w-[100px] text-right">
                      {selectedShip.type || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">DST:</span>
                    <span className="text-white truncate max-w-[100px] text-right">
                      {selectedShip.destination || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ETA:</span>
                    <span className="text-neon-yellow">
                      {selectedShip.eta?.split(" ")[0] || "--/--"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-800">
                    <span className="text-gray-500">SOG:</span>
                    <span className="font-bold">
                      {selectedShip.sog.toFixed(1)}{" "}
                      <span className="text-[9px] text-gray-500">KN</span>
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </MapProvider>
    </div>
  );
}
