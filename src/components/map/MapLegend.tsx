import React from "react";

const LEGEND_ITEMS = [
  { label: "MOVING", color: "#00ff9d" }, // Green
  { label: "ANCHORED", color: "#fbbf24" }, // Yellow
  { label: "MOORED", color: "#3b82f6" }, // Blue
  { label: "UNKNOWN", color: "#94a3b8" }, // Grey
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 left-6 z-1000 hidden md:block group">
      <div className="bg-black/80 backdrop-blur border border-gray-800 p-3 rounded-sm text-xs font-mono text-gray-400 transition-all duration-300 hover:border-gray-600">
        <div className="uppercase tracking-widest text-[10px] mb-2 text-gray-500 font-bold">
          Signal Key
        </div>
        <div className="space-y-2">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 5px ${item.color}`,
                }}
              />
              <span className="group-hover:text-white transition-colors">
                {item.label}
              </span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-px bg-white opacity-50 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"></div>
              </div>
              <span>HEADING/SOG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
