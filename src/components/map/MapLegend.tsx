"use client";

export default function MapLegend() {
  return (
    <div className="absolute bottom-24 md:bottom-6 left-3 md:left-6 z-[1000] pointer-events-none">
      <div className="bg-black/90 border border-gray-700 px-3 py-2 font-mono text-[10px] md:text-xs">
        <div className="text-[9px] md:text-[10px] text-gray-500 mb-1.5 tracking-widest">
          STATUS LEGEND
        </div>
        <div className="flex md:flex-col gap-3 md:gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
            <span className="text-gray-400">Moving</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
            <span className="text-gray-400">Stopped</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
            <span className="text-gray-400">Docked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
