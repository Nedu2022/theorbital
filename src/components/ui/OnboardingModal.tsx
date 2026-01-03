"use client";
import React, { useState, useEffect } from "react";
import { X, Globe, Zap, ShieldAlert, BadgeInfo } from "lucide-react";
import { useLanguage } from "../providers/LanguageContext";

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, direction } = useLanguage();

  useEffect(() => {
    // Check if user has seen onboarding
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
      <div
        className="bg-black border border-neon-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.2)] max-w-lg w-full rounded-sm overflow-hidden"
        dir={direction}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-b border-gray-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-white font-mono flex items-center gap-2">
              <Globe className="text-neon-cyan animate-pulse" />
              ORBITAL GOD MODE
            </h2>
            <p className="text-gray-400 text-xs mt-1 font-mono tracking-wider">
              CLASSIFIED SATELLITE FEED ACCESS
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 font-mono text-sm">
          <p className="text-gray-300 leading-relaxed">
            Welcome, Operator. You have been granted access to real-time global
            maritime intelligence.
          </p>

          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded border border-gray-800">
              <Globe className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold mb-1">
                  Global & Local Scans
                </h3>
                <p className="text-gray-400 text-xs">
                  Switch between "Global Orbit" for a world view or "Local Scan"
                  for detailed port operations. Use the Quick Jump menu to
                  teleport to strategic choke points like Suez or Singapore.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded border border-gray-800">
              <Zap className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold mb-1">
                  Live Asset Tracking
                </h3>
                <p className="text-gray-400 text-xs">
                  <span className="text-green-400">Green Dots</span> = Moving
                  Assets. <br />
                  <span className="text-yellow-400">Yellow Dots</span> =
                  Anchored Vessels. <br />
                  Click any ship to view its manifest, speed, and destination in
                  real-time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded border border-gray-800">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold mb-1">Crisis Simulation</h3>
                <p className="text-gray-400 text-xs">
                  Activate "Crisis Mode" to visualize high-risk zones (e.g., Red
                  Sea Piracy) and analyze supply chain impact.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan hover:text-black transition-all rounded-sm flex items-center justify-center gap-2 group"
          >
            <span>INITIALIZE DASHBOARD</span>
            <Zap className="w-4 h-4 group-hover:fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
