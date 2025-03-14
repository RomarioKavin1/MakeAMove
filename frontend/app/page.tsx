// src/app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
      <header className="p-6 bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            MakeAMove
          </h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/battle"
                  className="text-indigo-300 hover:text-white transition"
                >
                  Battle
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="text-indigo-300 hover:text-white transition"
                >
                  Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-indigo-300 hover:text-white transition"
                >
                  Marketplace
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mt-12">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Strategic Battles on the{" "}
              <span className="text-indigo-400">Blockchain</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Command your army of unique NFT heroes in tactical hexagonal
              combat. Build your deck, place your fortresses, and outmaneuver
              your opponents.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/battle"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-semibold transition shadow-lg hover:shadow-indigo-600/30"
              >
                Play Now
              </Link>
              <Link
                href="/marketplace"
                className="px-8 py-3 bg-transparent border-2 border-indigo-500 hover:bg-indigo-800 hover:bg-opacity-30 rounded-lg text-lg font-semibold transition"
              >
                Marketplace
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="w-full h-80 md:h-96 lg:h-[500px] relative">
              {/* Placeholder for game art */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg transform rotate-3 shadow-2xl">
                <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-40 flex items-center justify-center">
                  <p className="text-3xl font-bold">Game Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <section className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">
            Game Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-lg border border-indigo-500/30 hover:border-indigo-500 transition">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">Hexagonal Strategy</h4>
              <p className="text-gray-300">
                Battle on a dynamic hexagonal grid with varied terrain types
                that affect unit capabilities.
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-lg border border-indigo-500/30 hover:border-indigo-500 transition">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">NFT Cards</h4>
              <p className="text-gray-300">
                Build your collection of unique hero cards with different
                abilities, strengths, and synergies.
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-lg border border-indigo-500/30 hover:border-indigo-500 transition">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">Blockchain Integration</h4>
              <p className="text-gray-300">
                Own your cards as NFTs on the blockchain. Trade, sell, and
                collect rare and powerful units.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black bg-opacity-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2025 MakeAMove. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Discord
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
