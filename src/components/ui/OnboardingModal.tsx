"use client";
import React, { useState, useEffect } from "react";
import { X, Globe, Zap, ShieldAlert } from "lucide-react";

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("orbital_onboarding_seen");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("orbital_onboarding_seen", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-black border border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.2)] max-w-lg w-full overflow-hidden font-mono">
        <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-b border-gray-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-wider">
              <Globe className="text-cyan-400 animate-pulse" />
              ORBITAL
            </h2>
            <p className="text-gray-500 text-xs mt-1 tracking-widest">
              MARITIME COMMAND INTERFACE
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm">
          <p className="text-gray-300 leading-relaxed">
            Welcome, Operator. You have entered{" "}
            <strong className="text-cyan-400">ORBITAL</strong> — a real-time
            maritime domain awareness system used to track global logistics,
            naval assets, and crisis zones.
          </p>

          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-900/50 border border-gray-800">
              <Globe className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold mb-1 text-xs tracking-wider">
                  GLOBAL & LOCAL SCANS
                </h3>
                <p className="text-gray-500 text-xs">
                  <strong className="text-gray-300">GLOBAL ORBIT</strong>{" "}
                  provides a macro-view of world trade routes.{" "}
                  <strong className="text-gray-300">LOCAL SCAN</strong> focuses
                  on high-fidelity port operations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-900/50 border border-gray-800">
              <Zap className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold mb-1 text-xs tracking-wider">
                  LIVE ASSET TRACKING
                </h3>
                <p className="text-gray-500 text-xs">
                  Real-time AIS data stream processing.
                  <br />
                  <span className="text-green-400">● UNDERWAY</span>: Active
                  vessels en route.
                  <br />
                  <span className="text-yellow-400">● AT ANCHOR</span>: Vessels
                  stationary at anchorage.
                  <br />
                  Select any target for detailed manifest, velocity, and ETA.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-900/50 border border-gray-800">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold mb-1 text-xs tracking-wider">
                  CRISIS SIMULATION
                </h3>
                <p className="text-gray-500 text-xs">
                  Advanced predictive modeling for high-risk zones. Visualize
                  piracy impacts, choke point blockages (Suez, Panama), and
                  supply chain disruptions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleClose}
            className="group w-full py-3 bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider"
          >
            <span>INITIALIZE DASHBOARD</span>
            <Zap className="w-4 h-4 group-hover:fill-black transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
