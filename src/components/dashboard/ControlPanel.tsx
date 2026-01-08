import { useState } from "react";
import {
  Target,
  AlertTriangle,
  Ship,
  Globe,
  Anchor,
  MapPin,
  ChevronDown,
  ChevronUp,
  Crosshair,
} from "lucide-react";
import { MergedShip } from "@/hooks/useShipData";
import ViewCounter from "@/components/ui/ViewCounter";

interface ControlPanelProps {
  onZoneChange: (zone: string) => void;
  onCrisisTrigger: () => void;
  crisisActive: boolean;
  selectedShip: MergedShip | null;
  watchlist: MergedShip[];
  onAddToWatchlist: (ship: MergedShip) => void;
  onRemoveFromWatchlist: (mmsi: string) => void;
}

export default function ControlPanel({
  onZoneChange,
  onCrisisTrigger,
  crisisActive,
  selectedShip,
  watchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<"zones" | "fleet">("zones");
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden absolute top-20 left-4 z-[1100] bg-black border border-cyan-500/50 text-cyan-400 px-3 py-2 flex items-center gap-2 text-xs font-mono tracking-wider"
      >
        {isCollapsed ? (
          <>
            <Crosshair className="w-4 h-4" />
            <span>CONTROL</span>
          </>
        ) : (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>CLOSE</span>
          </>
        )}
      </button>

      <div
        className={`absolute top-32 md:top-24 left-3 right-3 md:left-4 md:right-auto md:w-72 bg-black/95 border border-gray-700 z-[1000] overflow-hidden flex flex-col text-xs font-mono transition-all duration-300 origin-top ${
          isCollapsed
            ? "scale-y-0 opacity-0 pointer-events-none md:scale-y-100 md:opacity-100 md:pointer-events-auto"
            : "scale-y-100 opacity-100"
        }`}
      >
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab("zones")}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 transition-colors tracking-wider ${
              activeTab === "zones"
                ? "bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>OPS ZONES</span>
          </button>
          <button
            onClick={() => setActiveTab("fleet")}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 transition-colors tracking-wider ${
              activeTab === "fleet"
                ? "bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>WATCHLIST ({watchlist.length})</span>
          </button>
        </div>

        <div className="p-3 space-y-3 max-h-[50vh] overflow-y-auto">
          {activeTab === "zones" && (
            <div className="space-y-2">
              <div className="text-[10px] text-gray-500 mb-2 tracking-widest">
                GEOFENCE SELECTOR
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onZoneChange("global")}
                  className="text-left px-3 py-2 bg-gray-900/50 border border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-2 text-gray-400"
                >
                  <Globe className="w-4 h-4" />
                  GLOBAL
                </button>
                <button
                  onClick={() => onZoneChange("rotterdam")}
                  className="text-left px-3 py-2 bg-gray-900/50 border border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-2 text-gray-400"
                >
                  <Anchor className="w-4 h-4" />
                  ROTTERDAM
                </button>
                <button
                  onClick={() => onZoneChange("singapore")}
                  className="text-left px-3 py-2 bg-gray-900/50 border border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-2 text-gray-400"
                >
                  <MapPin className="w-4 h-4" />
                  SINGAPORE
                </button>
                <button
                  onClick={() => onZoneChange("panama")}
                  className="text-left px-3 py-2 bg-gray-900/50 border border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-2 text-gray-400"
                >
                  <MapPin className="w-4 h-4" />
                  PANAMA
                </button>
                <button
                  onClick={() => onZoneChange("suez")}
                  className="text-left px-3 py-2 bg-gray-900/50 border border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-2 text-gray-400"
                >
                  <MapPin className="w-4 h-4" />
                  SUEZ
                </button>
                <button
                  onClick={() => onZoneChange("la")}
                  className="text-left px-3 py-2 bg-gray-900/50 border border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-2 text-gray-400"
                >
                  <MapPin className="w-4 h-4" />
                  LA/LB
                </button>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-700">
                <div className="text-[10px] text-gray-500 mb-2 tracking-widest">
                  CRISIS SIMULATION
                </div>
                <button
                  onClick={onCrisisTrigger}
                  className={`w-full py-2 px-3 flex items-center justify-center gap-2 transition-all border ${
                    crisisActive
                      ? "bg-red-500/30 border-red-500 text-red-400 animate-pulse"
                      : "bg-gray-900/50 border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {crisisActive ? "CRISIS ACTIVE" : "SIMULATE PIRACY EVENT"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "fleet" && (
            <div className="space-y-2">
              {watchlist.length > 0 ? (
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  <div className="text-[10px] text-gray-500 mb-2 tracking-widest">
                    PRIORITY VESSELS
                  </div>
                  {watchlist.map((ship) => (
                    <div
                      key={ship.mmsi}
                      className="p-3 bg-gray-900/50 border border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-cyan-400 font-bold text-xs">
                            {ship.name || "UNKNOWN"}
                          </span>
                          <div className="text-[10px] text-gray-500">
                            {ship.destination
                              ? `→ ${ship.destination}`
                              : "DEST: UNKNOWN"}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveFromWatchlist(ship.mmsi)}
                          className="text-gray-600 hover:text-red-400 text-xs transition-colors p-1"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-3 text-[10px] text-gray-500">
                        <span>{ship.sog?.toFixed(1) || "0"} KTS</span>
                        <span>{ship.heading || 0}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-2xl mb-2 opacity-30">◉</div>
                  <div className="text-gray-500 text-xs tracking-wider">
                    NO VESSELS TRACKED
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">
                    SELECT A TARGET TO ADD
                  </div>
                </div>
              )}
            </div>
          )}
          )}
        </div>
        <div className="p-3 border-t border-gray-800 bg-black/50">
           <ViewCounter />
        </div>
      </div>
    </>
  );
}
