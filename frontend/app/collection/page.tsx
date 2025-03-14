// src/app/collection/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import Card from "@/components/game/Card";
import { cardDatabase } from "@/lib/cardUtils";

export default function CollectionPage() {
  // In a full implementation, we would fetch the user's owned cards
  // For the MVP, we'll just show all available cards

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-6 bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            MakeAMove
          </Link>
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
                  className="text-white font-bold transition"
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

      <main className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Your Collection</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg text-gray-400 mb-2">Total Cards</h3>
              <p className="text-3xl font-bold">{cardDatabase.length}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg text-gray-400 mb-2">Rarest Card</h3>
              <p className="text-3xl font-bold">Legendary</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg text-gray-400 mb-2">Collection Value</h3>
              <p className="text-3xl font-bold">1,240 ETH</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Cards</h2>
            <div className="flex space-x-4">
              <select className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2">
                <option>All Types</option>
                <option>Warrior</option>
                <option>Archer</option>
                <option>Healer</option>
                <option>Tank</option>
                <option>Mage</option>
                <option>Scout</option>
              </select>
              <select className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2">
                <option>All Rarities</option>
                <option>Common</option>
                <option>Uncommon</option>
                <option>Rare</option>
                <option>Legendary</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {cardDatabase.map((card) => (
              <div key={card.id} className="flex justify-center">
                <Card card={card} size="md" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
