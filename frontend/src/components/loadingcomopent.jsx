import React from "react";

export default function LetMeCookLoader({ loading = false }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-base-200/80 backdrop-blur-md">
      {/* ✈️ Flying Plane */}
      <div className="overflow-hidden w-64 h-16 mb-6 relative">
        <span className="absolute left-0 text-6xl animate-[fly_2.5s_linear_infinite]">🛫</span>
      </div>

      <h2 className="text-3xl font-bold text-shadow-blue-600 mb-2 animate-pulse">
        Let me cook your itinerary...
      </h2>
      <p className="text-gray-800 italic text-sm">Packing destinations for takeoff 🌍</p>

      {/* Tailwind keyframes */}
      <style>
        {`
          @keyframes fly {
            0% { transform: translateX(-10%); }
            100% { transform: translate(100%) translateY(-5px); }
          
          }
        `}
      </style>
    </div>
  );
}
