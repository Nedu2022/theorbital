import { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageContext";
import {
  Target,
  AlertTriangle,
  Ship,
  Globe,
  Anchor,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MergedShip } from "@/hooks/useShipData";

interface ControlPanelProps {
  onZoneChange: (zone: string) => void;
  onCrisisTrigger: () => void;
  crisisActive: boolean;
  selectedShip: MergedShip | null;
}

export default function ControlPanel({
  onZoneChange,
  onCrisisTrigger,
  crisisActive,
  selectedShip,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<"zones" | "fleet">("zones");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden absolute top-20 left-4 z-[1100] bg-black/90 border border-gray-800 text-neon-cyan p-2 rounded-sm"
      >
        {isCollapsed ? <ChevronDown /> : <ChevronUp />}
      </button>

      <div
        className={`absolute top-32 md:top-20 left-4 w-72 bg-black/90 border border-gray-800 backdrop-blur-md z-[1000] rounded-sm overflow-hidden flex flex-col font-mono text-xs transition-all duration-300 origin-top ${
          isCollapsed
            ? "scale-y-0 opacity-0 pointer-events-none"
            : "scale-y-100 opacity-100"
        }`}
      >
        {/* Header Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab("zones")}
            className={`flex-1 py-3 px-2 flex items-center justify-center space-x-2 transition-colors ${
              activeTab === "zones"
                ? "bg-gray-800 text-neon-cyan"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t("ops_zones")}</span>
          </button>
          <button
            onClick={() => setActiveTab("fleet")}
            className={`flex-1 py-3 px-2 flex items-center justify-center space-x-2 transition-colors ${
              activeTab === "fleet"
                ? "bg-gray-800 text-neon-cyan"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>{t("watchlist")}</span>
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {activeTab === "zones" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase text-[10px] tracking-wider">
                  {t("geofence_selector")}
                </label>
                <div className="grid gap-2">
                  <button
                    onClick={() => onZoneChange("global")}
                    className="w-full text-left px-3 py-2 border border-gray-700 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all rounded-sm flex items-center group"
                  >
                    <Globe className="w-3 h-3 mr-2 text-gray-400 group-hover:text-neon-cyan" />
                    {t("global_view")}
                  </button>
                  <button
                    onClick={() => onZoneChange("rotterdam")}
                    className="w-full text-left px-3 py-2 border border-gray-700 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all rounded-sm flex items-center group"
                  >
                    <Target className="w-3 h-3 mr-2 text-gray-400 group-hover:text-neon-cyan" />
                    {t("port_of_rotterdam")}
                  </button>
                  <button
                    onClick={() => onZoneChange("singapore")}
                    className="w-full text-left px-3 py-2 border border-gray-700 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all rounded-sm flex items-center group"
                  >
                    <Anchor className="w-3 h-3 mr-2 text-gray-400 group-hover:text-neon-cyan" />
                    {t("singapore_strait")}
                  </button>
                  <button
                    onClick={() => onZoneChange("suez")}
                    className="w-full text-left px-3 py-2 border border-gray-700 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all rounded-sm flex items-center group"
                  >
                    <MapPin className="w-3 h-3 mr-2 text-gray-400 group-hover:text-neon-cyan" />
                    {t("suez_canal")}
                  </button>
                  <button
                    onClick={() => onZoneChange("dover")}
                    className="w-full text-left px-3 py-2 border border-gray-700 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all rounded-sm flex items-center group"
                  >
                    <MapPin className="w-3 h-3 mr-2 text-gray-400 group-hover:text-neon-cyan" />
                    {t("strait_of_dover")}
                  </button>
                  <button
                    onClick={() => onZoneChange("panama")}
                    className="w-full text-left px-3 py-2 border border-gray-700 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all rounded-sm flex items-center group"
                  >
                    <MapPin className="w-3 h-3 mr-2 text-gray-400 group-hover:text-neon-cyan" />
                    {t("panama_canal")}
                  </button>
                  <button
                    onClick={() => onZoneChange("la")}
                    className="w-full text-left px-3 py-2 border border-gray-700 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all rounded-sm flex items-center group"
                  >
                    <MapPin className="w-3 h-3 mr-2 text-gray-400 group-hover:text-neon-cyan" />
                    {t("la_lb")}
                  </button>
                  <button
                    onClick={() => onZoneChange("hormuz")}
                    className="w-full text-left px-3 py-2 border border-gray-700 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all rounded-sm flex items-center group"
                  >
                    <MapPin className="w-3 h-3 mr-2 text-gray-400 group-hover:text-neon-cyan" />
                    {t("strait_of_hormuz")}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <label className="text-gray-500 uppercase text-[10px] tracking-wider mb-2 block">
                  {t("crisis_simulation")}
                </label>
                <button
                  onClick={onCrisisTrigger}
                  className={`w-full py-3 px-2 border transition-all rounded-sm flex items-center justify-center font-bold tracking-wider ${
                    crisisActive
                      ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse"
                      : "border-red-900/50 text-red-700 hover:bg-red-900/20 hover:border-red-500"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {crisisActive ? t("crisis_active") : t("simulate_piracy")}
                </button>
              </div>
            </div>
          )}

          {activeTab === "fleet" && (
            <div className="space-y-2">
              <label className="text-gray-500 uppercase text-[10px] tracking-wider">
                {t("priority_vessels")}
              </label>
              {selectedShip ? (
                <div className="p-2 border border-neon-cyan/30 bg-neon-cyan/5 rounded-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-neon-cyan font-bold">
                      {selectedShip.name}
                    </span>
                    <span className="text-gray-400">{selectedShip.mmsi}</span>
                  </div>
                  <div className="text-gray-300">
                    DST: {selectedShip.destination}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-4 border border-dashed border-gray-800">
                  Select a vessel on map to pin
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
