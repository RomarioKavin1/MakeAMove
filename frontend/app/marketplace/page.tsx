// src/app/marketplace/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Card from "@/components/game/Card";
import { cardDatabase } from "@/lib/cardUtils";

export default function MarketplacePage() {
  // In a full implementation, we would fetch marketplace listings
  // For the MVP, we'll simulate listings with fixed prices

  const [sortBy, setSortBy] = useState<"price" | "rarity" | "type">("price");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRarity, setFilterRarity] = useState<string>("all");

  // Generate random prices for cards
  const listings = cardDatabase.map((card) => ({
    ...card,
    price: Math.round((Math.random() * 10 + 0.1) * 100) / 100, // Random price between 0.1 and 10 ETH
    seller: `User${Math.floor(Math.random() * 1000)}`, // Random seller
  }));

  // Apply filters
  const filteredListings = listings.filter((listing) => {
    if (filterType !== "all" && listing.type !== filterType) return false;
    if (filterRarity !== "all" && listing.rarity !== filterRarity) return false;
    return true;
  });

  // Apply sorting
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "rarity") {
      const rarityOrder = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }
    if (sortBy === "type") return a.type.localeCompare(b.type);
    return 0;
  });

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
                  className="text-indigo-300 hover:text-white transition"
                >
                  Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-white font-bold transition"
                >
                  Marketplace
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">NFT Marketplace</h1>

        <div className="mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg text-gray-400 mb-2">Sort By</h3>
                <select
                  className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 w-full"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="price">Price (Low to High)</option>
                  <option value="rarity">Rarity</option>
                  <option value="type">Type</option>
                </select>
              </div>
              <div>
                <h3 className="text-lg text-gray-400 mb-2">Filter by Type</h3>
                <select
                  className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 w-full"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="warrior">Warrior</option>
                  <option value="archer">Archer</option>
                  <option value="healer">Healer</option>
                  <option value="tank">Tank</option>
                  <option value="mage">Mage</option>
                  <option value="scout">Scout</option>
                </select>
              </div>
              <div>
                <h3 className="text-lg text-gray-400 mb-2">Filter by Rarity</h3>
                <select
                  className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 w-full"
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Featured Listings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-lg">
              <h3 className="text-lg text-gray-300 mb-2">Total Listings</h3>
              <p className="text-3xl font-bold">{sortedListings.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-lg">
              <h3 className="text-lg text-gray-300 mb-2">Average Price</h3>
              <p className="text-3xl font-bold">
                {(
                  sortedListings.reduce((sum, card) => sum + card.price, 0) /
                  sortedListings.length
                ).toFixed(2)}{" "}
                ETH
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-lg">
              <h3 className="text-lg text-gray-300 mb-2">Trading Volume</h3>
              <p className="text-3xl font-bold">842.5 ETH</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Connect Wallet</h3>
            <p className="text-gray-400 mb-4">
              Connect your wallet to buy, sell, and trade NFT cards
            </p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition">
              Connect Wallet
            </button>
          </div>
        </div>

        {/* Marketplace Listings */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Marketplace Listings</h2>
            <p className="text-gray-400">{sortedListings.length} items</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-gray-800 rounded-lg overflow-hidden transition transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-900/20"
            >
              <div className="p-4">
                <Card card={listing} size="sm" />
              </div>
              <div className="p-4 bg-gray-900">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-400 text-sm truncate">
                    {listing.seller}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-md text-xs ${
                      listing.rarity === "legendary"
                        ? "bg-purple-700"
                        : listing.rarity === "rare"
                        ? "bg-blue-700"
                        : listing.rarity === "uncommon"
                        ? "bg-green-700"
                        : "bg-gray-700"
                    }`}
                  >
                    {listing.rarity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-xl">{listing.price} ETH</p>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm transition">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-1 rounded-md bg-gray-800 text-gray-400">
              Previous
            </button>
            <button className="px-3 py-1 rounded-md bg-indigo-600 text-white">
              1
            </button>
            <button className="px-3 py-1 rounded-md bg-gray-800 text-gray-400">
              2
            </button>
            <button className="px-3 py-1 rounded-md bg-gray-800 text-gray-400">
              3
            </button>
            <span className="text-gray-600">...</span>
            <button className="px-3 py-1 rounded-md bg-gray-800 text-gray-400">
              10
            </button>
            <button className="px-3 py-1 rounded-md bg-gray-800 text-gray-400">
              Next
            </button>
          </nav>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black bg-opacity-50 py-8 mt-16">
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
