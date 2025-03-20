"use client";
import { usePetraWallet } from "@/context/WalletProvider";
import React, { useState, useRef, useEffect } from "react";

// You would replace these with actual local images
const walletIcons = {
  petra: "/images/wallets/petra.svg",
  martian: "/images/wallets/martian.svg",
  pontem: "/images/wallets/pontem.svg",
  rise: "/images/wallets/rise.svg",
};

type WalletOption = {
  id: string;
  name: string;
  icon: string;
  installUrl: string;
  checkInstalled: () => boolean;
};

export const WalletConnectButton: React.FC = () => {
  const {
    wallet: petraWallet,
    connected,
    account,
    connect,
    disconnect,
  } = usePetraWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Define wallet options
  const walletOptions: WalletOption[] = [
    {
      id: "petra",
      name: "Petra Wallet",
      icon: walletIcons.petra,
      installUrl: "https://petra.app/",
      checkInstalled: () => typeof window !== "undefined" && "aptos" in window,
    },
    {
      id: "martian",
      name: "Martian Wallet",
      icon: walletIcons.martian,
      installUrl: "https://martianwallet.xyz/",
      checkInstalled: () =>
        typeof window !== "undefined" && "martian" in window,
    },
    {
      id: "pontem",
      name: "Pontem Wallet",
      icon: walletIcons.pontem,
      installUrl: "https://pontem.network/",
      checkInstalled: () => typeof window !== "undefined" && "pontem" in window,
    },
    {
      id: "rise",
      name: "Rise Wallet",
      icon: walletIcons.rise,
      installUrl: "https://risewallet.io/",
      checkInstalled: () => typeof window !== "undefined" && "rise" in window,
    },
  ];

  // Set active wallet when connected
  useEffect(() => {
    if (connected && petraWallet) {
      setActiveWallet("petra");
    } else {
      setActiveWallet(null);
    }
  }, [connected, petraWallet]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleConnectWallet = async (option: WalletOption) => {
    if (!option.checkInstalled()) {
      window.open(option.installUrl, "_blank");
      return;
    }

    setIsLoading(true);
    try {
      if (option.id === "petra") {
        await connect();
        setActiveWallet("petra");
      }
      // Add other wallet connect implementations as needed

      setIsModalOpen(false);
    } catch (error) {
      console.error(`Failed to connect to ${option.name}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnect();
      setActiveWallet(null);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If already connected, show account info
  if (connected && account) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm flex items-center space-x-2"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          {truncateAddress(account.address)}
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isModalOpen && (
          <div
            ref={modalRef}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl z-10 border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Connected Wallet
                  </p>
                  <p className="text-xs text-gray-500">
                    {truncateAddress(account.address)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-gray-200">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(account.address);
                  setIsModalOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Address
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://explorer.aptoslabs.com/account/${account.address}`,
                    "_blank"
                  );
                  setIsModalOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mt-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View on Explorer
              </button>
            </div>

            <div className="p-3">
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {isLoading ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default connect button
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition duration-150"
      >
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Connect Wallet
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Connect your wallet to access this application
              </p>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {walletOptions.map((option) => {
                  const isInstalled = option.checkInstalled();

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleConnectWallet(option)}
                      className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-lg p-2 mr-3">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {/* Replace with actual image */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-blue-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 2H8.828a2 2 0 00-1.414.586L6.293 3.707A1 1 0 015.586 4H4z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {option.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {isInstalled ? "Detected" : "Not installed"}
                          </p>
                        </div>
                      </div>
                      <div>
                        {isInstalled ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Connect
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Install
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 text-xs text-center text-gray-500">
                By connecting your wallet, you agree to our Terms of Service and
                Privacy Policy
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
