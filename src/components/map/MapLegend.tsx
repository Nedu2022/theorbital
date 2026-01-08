"use client";

export default function MapLegend() {
  return (
    <div className="absolute bottom-12 md:bottom-6 left-3 md:left-6 z-[1000] pointer-events-none">
      <div className="bg-black/80 border border-gray-700 px-3 py-2 font-mono text-xs">
        <div className="text-[10px] text-gray-500 mb-2 tracking-widest">
          STATUS LEGEND
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
            <span className="text-gray-400">MOVING</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
            <span className="text-gray-400">STOPPED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
            <span className="text-gray-400">DOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
