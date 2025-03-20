"use client";
// components/WalletConnectButton.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Wallet,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { usePetraWallet } from "@/context/WalletProvider";

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
  const [copySuccess, setCopySuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Define wallet options
  const walletOptions = [
    {
      id: "petra",
      name: "Petra Wallet",
      description: "The native wallet for Aptos",
      icon: (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            fillRule="evenodd"
            clip-rule="evenodd"
            d="M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100ZM46.8071 25.0058C46.8071 21.6535 44.0899 18.9363 40.7376 18.9363C37.3854 18.9363 34.6681 21.6535 34.6681 25.0058C34.6681 28.358 37.3854 31.0753 40.7376 31.0753C44.0899 31.0753 46.8071 28.358 46.8071 25.0058ZM58.4404 33.9927C63.6017 33.9927 67.7828 29.8116 67.7828 24.6503C67.7828 19.489 63.6017 15.3079 58.4404 15.3079C53.2791 15.3079 49.098 19.489 49.098 24.6503C49.098 29.8116 53.2791 33.9927 58.4404 33.9927ZM63.6362 48.6308C68.7975 48.6308 72.9786 44.4497 72.9786 39.2884C72.9786 34.1271 68.7975 29.946 63.6362 29.946C58.4749 29.946 54.2938 34.1271 54.2938 39.2884C54.2938 44.4497 58.4749 48.6308 63.6362 48.6308ZM33.9928 65.3596C39.1541 65.3596 43.3352 61.1785 43.3352 56.0172C43.3352 50.8559 39.1541 46.6748 33.9928 46.6748C28.8315 46.6748 24.6503 50.8559 24.6503 56.0172C24.6503 61.1785 28.8315 65.3596 33.9928 65.3596ZM39.8894 80.3435C45.0507 80.3435 49.2318 76.1624 49.2318 71.0011C49.2318 65.8398 45.0507 61.6587 39.8894 61.6587C34.7281 61.6587 30.547 65.8398 30.547 71.0011C30.547 76.1624 34.7281 80.3435 39.8894 80.3435ZM63.6362 85.0631C68.7975 85.0631 72.9786 80.882 72.9786 75.7207C72.9786 70.5594 68.7975 66.3783 63.6362 66.3783C58.4749 66.3783 54.2938 70.5594 54.2938 75.7207C54.2938 80.882 58.4749 85.0631 63.6362 85.0631Z"
            fill="#8ECAF7"
          />
        </svg>
      ),
      installUrl: "https://petra.app/",
      checkInstalled: () => typeof window !== "undefined" && "aptos" in window,
    },
    {
      id: "martian",
      name: "Martian Wallet",
      description: "A secure web3 wallet for Aptos",
      icon: (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
            fill="#232631"
          />
          <path
            d="M16.1732 8.06189C16.0019 7.97972 15.7981 7.97972 15.6268 8.06189L7.32604 11.9285C7.14414 12.0162 7.02604 12.1992 7.02604 12.3996V19.6004C7.02604 19.8008 7.14414 19.9838 7.32604 20.0715L15.6268 23.9381C15.7981 24.0203 16.0019 24.0203 16.1732 23.9381L24.474 20.0715C24.6559 19.9838 24.774 19.8008 24.774 19.6004V12.3996C24.774 12.1992 24.6559 12.0162 24.474 11.9285L16.1732 8.06189Z"
            fill="#5294FF"
          />
          <path
            d="M12.0578 16.0001L11.4219 16.2942V17.1766L12.0578 16.9295V16.0001Z"
            fill="white"
          />
          <path
            d="M7.17188 18.4413L10.6142 20.1766L12.0755 19.5177V19.4237L10.6437 17.9766H10.5373L7.17188 18.4413Z"
            fill="white"
          />
          <path
            d="M24.628 18.4413L21.1856 20.1766L19.7244 19.5177V19.4237L21.1561 17.9766H21.2626L24.628 18.4413Z"
            fill="white"
          />
          <path
            d="M15.7764 13.1297L13.1856 16.1237L15.8829 17.7295H15.9421L19.7529 17.0001H19.8121L20.7764 15.9766L19.3151 13.883L17.1856 13.0472L15.7764 13.1297Z"
            fill="white"
          />
          <path
            d="M19.7423 19.5177V20.4413L15.9893 21.5118H15.8829L12.0697 20.4413V19.5177L15.7764 20.5413L19.7423 19.5177Z"
            fill="white"
          />
          <path
            d="M19.7422 17.0001V17.2472V19.5177L16.1244 20.2942L15.9951 20.2354L14.0121 18.6766L13.5893 17.977H12.1279L12.0687 19.5177L11.422 17.1766V16.2942L11.6599 14.7354L12.0687 14.4413L13.1279 14.1472L15.9951 14.5354L17.1601 15.7001L19.7422 17.0001Z"
            fill="white"
          />
        </svg>
      ),
      installUrl: "https://martianwallet.xyz/",
      checkInstalled: () =>
        typeof window !== "undefined" && "martian" in window,
    },
    {
      id: "pontem",
      name: "Pontem Wallet",
      description: "Your gateway to Aptos",
      icon: (
        <svg
          viewBox="0 0 129 129"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="129" height="129" rx="64.5" fill="#161617" />
          <path
            d="M64.5 108C88.5244 108 108 88.5244 108 64.5C108 40.4756 88.5244 21 64.5 21C40.4756 21 21 40.4756 21 64.5C21 88.5244 40.4756 108 64.5 108Z"
            fill="black"
            stroke="url(#paint0_linear_217_3556)"
            strokeWidth="2"
          />
          <path
            d="M53.7891 56.8203L43.7461 70.0625L53.789 83.3047H73.8359L83.879 70.0625L73.8359 56.8203H53.7891ZM60.1914 63.4219H67.4219L71.0547 70.0625L67.4219 76.7031H60.1914L56.5586 70.0625L60.1914 63.4219Z"
            fill="url(#paint1_linear_217_3556)"
          />
          <path
            d="M50.332 44.6406L45.7734 50.7734H76.707L72.1641 44.6406H50.332Z"
            fill="url(#paint2_linear_217_3556)"
          />
          <path
            d="M81.0078 44.6406L76.457 50.7734H86.4922L91.0586 44.6406H81.0078Z"
            fill="url(#paint3_linear_217_3556)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_217_3556"
              x1="20"
              y1="64.5"
              x2="109"
              y2="64.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0FA46E" />
              <stop offset="1" stopColor="#78E794" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_217_3556"
              x1="43.7461"
              y1="70.0625"
              x2="83.879"
              y2="70.0625"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0FA46E" />
              <stop offset="1" stopColor="#78E794" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_217_3556"
              x1="45.7734"
              y1="47.707"
              x2="76.707"
              y2="47.707"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0FA46E" />
              <stop offset="1" stopColor="#78E794" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_217_3556"
              x1="76.457"
              y1="47.707"
              x2="91.0586"
              y2="47.707"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0FA46E" />
              <stop offset="1" stopColor="#78E794" />
            </linearGradient>
          </defs>
        </svg>
      ),
      installUrl: "https://pontem.network/pontem-wallet",
      checkInstalled: () => typeof window !== "undefined" && "pontem" in window,
    },
    {
      id: "rise",
      name: "Rise Wallet",
      description: "The simple way to manage your assets",
      icon: (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
            fill="#1E1E1E"
          />
          <path
            d="M16.0039 5.33385L10.6706 14.0005L16.0039 11.5005L21.3372 14.0005L16.0039 5.33385Z"
            fill="#14F195"
          />
          <path
            d="M16.0039 23.3339L10.6706 17.3339L16.0039 26.6672L21.3372 17.3339L16.0039 23.3339Z"
            fill="#14F195"
          />
        </svg>
      ),
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

  // Reset copy status after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const handleConnectWallet = async (option: (typeof walletOptions)[0]) => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
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
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 flex items-center space-x-2 group"
        >
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2.5 shadow-sm shadow-green-300/50"></div>
            <span>{truncateAddress(account.address)}</span>
          </div>
          <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" />
        </button>

        {isModalOpen && (
          <div
            ref={modalRef}
            className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-10 border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 animate-fade-in"
            style={{ animation: "fadeIn 0.2s ease-out" }}
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-500/10 to-purple-600/10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Connected Wallet
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {truncateAddress(account.address)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={() => copyToClipboard(account.address)}
                className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-3 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                    Copy Address
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://explorer.aptoslabs.com/account/${account.address}`,
                    "_blank"
                  );
                  setIsModalOpen(false);
                }}
                className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mt-1 transition-colors duration-150"
              >
                <ExternalLink className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                View on Explorer
              </button>
            </div>

            <div className="p-3">
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150"
              >
                <LogOut className="h-4 w-4 mr-3" />
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
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
            Connecting...
          </div>
        ) : (
          "Connect Wallet"
        )}
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in"
            style={{ animation: "scaleIn 0.2s ease-out" }}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-500/10 to-purple-600/10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Connect Wallet
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-150"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Connect your wallet to access this application and interact with
                the Aptos blockchain.
              </p>
            </div>

            <div className="p-6 max-h-80 overflow-y-auto">
              <div className="space-y-4">
                {walletOptions.map((option) => {
                  const isInstalled = option.checkInstalled();

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleConnectWallet(option)}
                      className="flex items-center justify-between w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg dark:hover:shadow-indigo-500/20 transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 bg-gray-100 dark:bg-gray-700 p-2 flex items-center justify-center">
                          {option.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {option.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div>
                        {isInstalled ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm">
                            Connect
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            Install
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400 px-2">
                By connecting your wallet, you agree to our Terms of Service and
                Privacy Policy
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WalletConnectButton;
