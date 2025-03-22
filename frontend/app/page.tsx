// src/app/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Enhanced background with animated gradient overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 pixel-grid-bg"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20"></div>
        <div className="absolute inset-0 animate-pulse-slow opacity-10 bg-gradient-radial from-indigo-500/30 to-transparent"></div>
      </div>

      <main className="relative z-10 flex-grow container mx-auto py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl text-center">
          {/* Logo area with enhanced styling */}
          <div className="mb-16 transform hover:scale-105 transition duration-500">
            <h1 className="text-6xl sm:text-7xl pixel-text text-white text-glow mb-3">
              MakeAMove
            </h1>
            <p className="text-indigo-300 pixel-text text-sm sm:text-base tracking-widest">
              TACTICAL BLOCKCHAIN BATTLES
            </p>
          </div>

          {/* Decorative hex grid pattern above buttons */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 transform rotate-45 ${
                    i % 2 === 0 ? "bg-indigo-700" : "bg-indigo-500"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Action buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/battle"
              className="arcade-btn bg-indigo-700 hover:bg-indigo-600 text-white px-10 py-4 text-lg relative group"
            >
              <span className="relative z-10">PLAY NOW</span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/marketplace"
              className="arcade-btn bg-gray-800 hover:bg-gray-700 text-white px-10 py-4 text-lg relative group"
            >
              <span className="relative z-10">MARKETPLACE</span>
              <span className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </div>

          {/* Decorative elements below buttons */}
          <div className="mt-16 flex justify-center">
            <div className="w-32 h-1 bg-indigo-600"></div>
          </div>

          {/* Game feature indicators */}
          <div className="mt-8 flex justify-center space-x-8">
            <div className="text-xs text-indigo-300 pixel-text flex flex-col items-center">
              <div className="w-10 h-10 mb-2 border border-indigo-500 flex items-center justify-center">
                <div className="w-5 h-5 bg-indigo-500"></div>
              </div>
              <span>PVP BATTLES</span>
            </div>
            <div className="text-xs text-indigo-300 pixel-text flex flex-col items-center">
              <div className="w-10 h-10 mb-2 border border-indigo-500 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-indigo-500 transform rotate-45"></div>
              </div>
              <span>HEX STRATEGY</span>
            </div>
            <div className="text-xs text-indigo-300 pixel-text flex flex-col items-center">
              <div className="w-10 h-10 mb-2 border border-indigo-500 flex items-center justify-center">
                <div className="w-6 h-4 border border-indigo-500"></div>
              </div>
              <span>NFT CARDS</span>
            </div>
          </div>
        </div>
      </main>

      {/* Animated elements for visual interest */}
      <div className="fixed top-10 left-10 w-5 h-5 bg-indigo-500 opacity-20 animate-pulse"></div>
      <div className="fixed bottom-10 right-10 w-5 h-5 bg-purple-500 opacity-20 animate-pulse"></div>
      <div className="fixed top-1/4 right-1/4 w-3 h-3 bg-indigo-300 opacity-10 animate-ping"></div>
      <div className="fixed bottom-1/3 left-1/3 w-3 h-3 bg-purple-300 opacity-10 animate-ping"></div>
    </div>
  );
}
