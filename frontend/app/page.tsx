// src/app/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePetraWallet } from "@/context/WalletProvider";
import ConnectButton from "@/components/petra/ConnectButton";
import { LogOut } from "lucide-react";

export default function Home() {
  const { connected, disconnect } = usePetraWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await disconnect();
      console.log("Wallet disconnected successfully");
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900"></div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex justify-between items-center relative z-1">
          <div className="text-2xl font-bold pixel-text text-indigo-300">
            MakeAMove
          </div>
          <div className="flex items-center space-x-4">
            <ConnectButton />
            {connected && (
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="arcade-btn bg-red-700 hover:bg-red-600 text-white px-4 py-2 text-sm relative group"
                data-testid="landing-disconnect-btn"
              >
                {isLoading ? (
                  <span className="animate-pulse pixel-text">
                    DISCONNECTING...
                  </span>
                ) : (
                  <span className="relative z-10 pixel-text">DISCONNECT</span>
                )}
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="relative  flex-grow container mx-auto py-12 px-4 flex items-center justify-center z-0">
        <div className="max-w-2xl text-center">
          {/* Logo area with enhanced styling */}
          <div className="mb-16 transform hover:scale-105 transition duration-500">
            <h1 className="text-6xl sm:text-7xl pixel-text text-white text-glow mb-3 z-10">
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
            <PlayNowButton />
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
          <div className="mt-12 flex justify-center space-x-8">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center">
                <div className="text-lg font-bold">🏆</div>
              </div>
              <p className="mt-2 text-sm text-gray-300">PVP Battles</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center">
                <div className="text-lg font-bold">🎴</div>
              </div>
              <p className="mt-2 text-sm text-gray-300">Collectible Cards</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center">
                <div className="text-lg font-bold">⛓️</div>
              </div>
              <p className="mt-2 text-sm text-gray-300">Blockchain Powered</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
    </div>
  );
}

// Custom PlayNowButton component that connects to the contract
const PlayNowButton = () => {
  const router = useRouter();
  const { wallet, account, connected, connect } = usePetraWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Contract address
  const contractAddress =
    "0x11e2d0c73089ef8d8a5758bd85c5a00101ab43b97123eae32e2dc8309cf880e4";

  const handleClick = async () => {
    // Clear previous states
    setError(null);
    setTxHash(null);

    if (!connected) {
      try {
        await connect();
      } catch (err) {
        console.error("Failed to connect wallet:", err);
        setError("Please connect your wallet to play.");
        return;
      }
    }

    // Ensure wallet is connected
    if (!wallet || !account) {
      setError("Please connect your wallet to play.");
      return;
    }

    setIsProcessing(true);

    try {
      // Create payload for the create_game function
      // For simplicity, we'll use a fixed AI agent address and have player start the game
      const aiAgentAddress = "0x1"; // This would be replaced with an actual AI agent address in production
      const playerStarts = true;

      const payload = {
        type: "entry_function_payload",
        function: `${contractAddress}::make_a_move::create_game`,
        type_arguments: [],
        arguments: [aiAgentAddress, playerStarts],
      };

      // Sign and submit the transaction
      const response = await wallet.signAndSubmitTransaction(payload);
      setTxHash(response.hash);

      // Wait for 2 seconds to simulate transaction completion
      setTimeout(() => {
        setIsProcessing(false);
        // Navigate to the battle page after successful transaction
        router.push("/battle");
      }, 2000);
    } catch (err) {
      console.error("Transaction failed:", err);
      setIsProcessing(false);
      setError("Failed to create game. Please try again.");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`arcade-btn bg-indigo-700 hover:bg-indigo-600 text-white px-10 py-4 text-lg relative group ${
          isProcessing ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        <span className="relative z-10">
          {isProcessing ? "PROCESSING..." : "PLAY NOW"}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </button>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {txHash && (
        <div className="absolute top-full left-0 right-0 mt-2 text-green-400 text-xs text-center">
          Transaction submitted! Hash: {txHash.substring(0, 10)}...
        </div>
      )}
    </div>
  );
};
