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
  AlertCircle,
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
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

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
      iconString:
        '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><path fill-rule="evenodd" clip-rule="evenodd" d="M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100ZM46.8071 25.0058C46.8071 21.6535 44.0899 18.9363 40.7376 18.9363C37.3854 18.9363 34.6681 21.6535 34.6681 25.0058C34.6681 28.358 37.3854 31.0753 40.7376 31.0753C44.0899 31.0753 46.8071 28.358 46.8071 25.0058ZM58.4404 33.9927C63.6017 33.9927 67.7828 29.8116 67.7828 24.6503C67.7828 19.489 63.6017 15.3079 58.4404 15.3079C53.2791 15.3079 49.098 19.489 49.098 24.6503C49.098 29.8116 53.2791 33.9927 58.4404 33.9927ZM63.6362 48.6308C68.7975 48.6308 72.9786 44.4497 72.9786 39.2884C72.9786 34.1271 68.7975 29.946 63.6362 29.946C58.4749 29.946 54.2938 34.1271 54.2938 39.2884C54.2938 44.4497 58.4749 48.6308 63.6362 48.6308ZM33.9928 65.3596C39.1541 65.3596 43.3352 61.1785 43.3352 56.0172C43.3352 50.8559 39.1541 46.6748 33.9928 46.6748C28.8315 46.6748 24.6503 50.8559 24.6503 56.0172C24.6503 61.1785 28.8315 65.3596 33.9928 65.3596ZM39.8894 80.3435C45.0507 80.3435 49.2318 76.1624 49.2318 71.0011C49.2318 65.8398 45.0507 61.6587 39.8894 61.6587C34.7281 61.6587 30.547 65.8398 30.547 71.0011C30.547 76.1624 34.7281 80.3435 39.8894 80.3435ZM63.6362 85.0631C68.7975 85.0631 72.9786 80.882 72.9786 75.7207C72.9786 70.5594 68.7975 66.3783 63.6362 66.3783C58.4749 66.3783 54.2938 70.5594 54.2938 75.7207C54.2938 80.882 58.4749 85.0631 63.6362 85.0631Z" fill="#8ECAF7"></path></svg>',
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
      iconString:
        '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#232631"></path><path d="M16.1732 8.06189C16.0019 7.97972 15.7981 7.97972 15.6268 8.06189L7.32604 11.9285C7.14414 12.0162 7.02604 12.1992 7.02604 12.3996V19.6004C7.02604 19.8008 7.14414 19.9838 7.32604 20.0715L15.6268 23.9381C15.7981 24.0203 16.0019 24.0203 16.1732 23.9381L24.474 20.0715C24.6559 19.9838 24.774 19.8008 24.774 19.6004V12.3996C24.774 12.1992 24.6559 12.0162 24.474 11.9285L16.1732 8.06189Z" fill="#5294FF"></path><path d="M12.0578 16.0001L11.4219 16.2942V17.1766L12.0578 16.9295V16.0001Z" fill="white"></path><path d="M7.17188 18.4413L10.6142 20.1766L12.0755 19.5177V19.4237L10.6437 17.9766H10.5373L7.17188 18.4413Z" fill="white"></path><path d="M24.628 18.4413L21.1856 20.1766L19.7244 19.5177V19.4237L21.1561 17.9766H21.2626L24.628 18.4413Z" fill="white"></path><path d="M15.7764 13.1297L13.1856 16.1237L15.8829 17.7295H15.9421L19.7529 17.0001H19.8121L20.7764 15.9766L19.3151 13.883L17.1856 13.0472L15.7764 13.1297Z" fill="white"></path><path d="M19.7423 19.5177V20.4413L15.9893 21.5118H15.8829L12.0697 20.4413V19.5177L15.7764 20.5413L19.7423 19.5177Z" fill="white"></path><path d="M19.7422 17.0001V17.2472V19.5177L16.1244 20.2942L15.9951 20.2354L14.0121 18.6766L13.5893 17.977H12.1279L12.0687 19.5177L11.422 17.1766V16.2942L11.6599 14.7354L12.0687 14.4413L13.1279 14.1472L15.9951 14.5354L17.1601 15.7001L19.7422 17.0001Z" fill="white"></path></svg>',
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
              <stop stopColor="#A67C00" />
              <stop offset="0.484375" stopColor="#DAAF49" />
              <stop offset="1" stopColor="#A67C00" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_217_3556"
              x1="43.7461"
              y1="70.0625"
              x2="83.879"
              y2="70.0625"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A67C00" />
              <stop offset="0.484375" stopColor="#DAAF49" />
              <stop offset="1" stopColor="#A67C00" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_217_3556"
              x1="45.7734"
              y1="47.707"
              x2="76.707"
              y2="47.707"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A67C00" />
              <stop offset="0.484375" stopColor="#DAAF49" />
              <stop offset="1" stopColor="#A67C00" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_217_3556"
              x1="76.457"
              y1="47.707"
              x2="91.0586"
              y2="47.707"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A67C00" />
              <stop offset="0.484375" stopColor="#DAAF49" />
              <stop offset="1" stopColor="#A67C00" />
            </linearGradient>
          </defs>
        </svg>
      ),
      iconString:
        '<svg viewBox="0 0 129 129" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><rect width="129" height="129" rx="64.5" fill="#161617"></rect><path d="M64.5 108C88.5244 108 108 88.5244 108 64.5C108 40.4756 88.5244 21 64.5 21C40.4756 21 21 40.4756 21 64.5C21 88.5244 40.4756 108 64.5 108Z" fill="black" stroke="url(#paint0_linear_217_3556)" stroke-width="2"></path><path d="M53.7891 56.8203L43.7461 70.0625L53.789 83.3047H73.8359L83.879 70.0625L73.8359 56.8203H53.7891ZM60.1914 63.4219H67.4219L71.0547 70.0625L67.4219 76.7031H60.1914L56.5586 70.0625L60.1914 63.4219Z" fill="url(#paint1_linear_217_3556)"></path><path d="M50.332 44.6406L45.7734 50.7734H76.707L72.1641 44.6406H50.332Z" fill="url(#paint2_linear_217_3556)"></path><path d="M81.0078 44.6406L76.457 50.7734H86.4922L91.0586 44.6406H81.0078Z" fill="url(#paint3_linear_217_3556)"></path><defs><linearGradient id="paint0_linear_217_3556" x1="20" y1="64.5" x2="109" y2="64.5" gradientUnits="userSpaceOnUse"><stop stop-color="#A67C00"></stop><stop offset="0.484375" stop-color="#DAAF49"></stop><stop offset="1" stop-color="#A67C00"></stop></linearGradient><linearGradient id="paint1_linear_217_3556" x1="43.7461" y1="70.0625" x2="83.879" y2="70.0625" gradientUnits="userSpaceOnUse"><stop stop-color="#A67C00"></stop><stop offset="0.484375" stop-color="#DAAF49"></stop><stop offset="1" stop-color="#A67C00"></stop></linearGradient><linearGradient id="paint2_linear_217_3556" x1="45.7734" y1="47.707" x2="76.707" y2="47.707" gradientUnits="userSpaceOnUse"><stop stop-color="#A67C00"></stop><stop offset="0.484375" stop-color="#DAAF49"></stop><stop offset="1" stop-color="#A67C00"></stop></linearGradient><linearGradient id="paint3_linear_217_3556" x1="76.457" y1="47.707" x2="91.0586" y2="47.707" gradientUnits="userSpaceOnUse"><stop stop-color="#A67C00"></stop><stop offset="0.484375" stop-color="#DAAF49"></stop><stop offset="1" stop-color="#A67C00"></stop></linearGradient></defs></svg>',
      installUrl:
        "https://chrome.google.com/webstore/detail/pontem-wallet/phkbamefinggmakgklpkljjmgibohnba",
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

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
        if (typeof window !== "undefined" && "hideFrameModal" in window) {
          (window as any).hideFrameModal();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Effect to show/hide modal in iframe
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("showFrameModal" in window) ||
      !("hideFrameModal" in window)
    )
      return;

    if (isModalOpen && account && connected) {
      // Connected wallet dropdown
      const modalHTML = `
        <div class="fixed right-4 top-16 w-72 bg-gray-900 border-2 border-indigo-500 rounded-lg shadow-2xl overflow-hidden pixelated-shadow pixel-pattern">
          <div class="p-4 border-b-2 border-indigo-500 bg-gradient-to-r from-indigo-900/40 to-purple-900/40">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-indigo-700 border-2 border-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M19 12H5m14 0l-7 7m7-7l-7-7"/></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-white pixel-text">
                  WALLET
                </p>
                <p class="text-xs text-gray-400 mt-0.5 font-mono">
                  ${truncateAddress(account.address)}
                </p>
              </div>
            </div>
          </div>
          <div class="p-3 border-b-2 border-indigo-500/50">
            <button class="wallet-copy-btn flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors duration-150">
              <span class="mr-3">📋</span>
              <span class="pixel-text">COPY ADDRESS</span>
            </button>
            <button class="wallet-explorer-btn flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors duration-150 mt-1">
              <span class="mr-3">🔍</span>
              <span class="pixel-text">VIEW ON EXPLORER</span>
            </button>
          </div>
          <div class="p-3">
            <button class="wallet-disconnect-btn arcade-btn bg-red-600 hover:bg-red-500 text-white px-3 py-2 text-sm w-full relative group">
              <span class="relative z-10 pixel-text">DISCONNECT</span>
            </button>
          </div>
        </div>
      `;

      (window as any).showFrameModal(modalHTML);

      // Add event listener for iframe message
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "modalOverlayClicked") {
          setIsModalOpen(false);
        }
      };

      window.addEventListener("message", messageHandler);

      return () => {
        window.removeEventListener("message", messageHandler);
        if (!isModalOpen) {
          (window as any).hideFrameModal();
        }
      };
    } else if (isModalOpen) {
      // Connect wallet modal
      const modalHTML = `
        <div class="bg-gray-900 border-2 border-indigo-500 rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden pixelated-shadow pixel-pattern">
          <div class="p-6 border-b-2 border-indigo-500 bg-gradient-to-r from-indigo-900/40 to-purple-900/40">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-semibold text-white pixel-text">
                CONNECT WALLET
              </h3>
              <button class="close-modal-btn text-white hover:text-indigo-300 transition-colors duration-150 pixel-text">
                X
              </button>
            </div>
            <p class="mt-3 text-sm text-gray-300">
              Connect your wallet to access this application and interact with
              the Aptos blockchain.
            </p>
          </div>
          <div class="p-6 max-h-80 overflow-y-auto bg-gray-800">
            <div class="space-y-4">
              ${walletOptions
                .map((option) => {
                  const isInstalled = option.checkInstalled();
                  return `
                  <button class="wallet-option-btn flex items-center justify-between w-full p-4 border-2 border-indigo-500/50 bg-gray-900 hover:border-indigo-400 hover:bg-gray-800 transition-all duration-200" data-wallet-id="${
                    option.id
                  }">
                    <div class="flex items-center">
                      <div class="w-12 h-12 border-2 border-indigo-500/30 overflow-hidden mr-4 bg-gray-800 p-2 flex items-center justify-center">
                        ${option.iconString}
                      </div>
                      <div class="text-left">
                        <p class="text-sm font-semibold text-white pixel-text">
                          ${option.name}
                        </p>
                        <p class="text-xs text-gray-400 mt-0.5">
                          ${option.description}
                        </p>
                      </div>
                    </div>
                    <div>
                      ${
                        isInstalled
                          ? `<span class="arcade-btn bg-indigo-700 hover:bg-indigo-600 px-3 py-1 text-xs text-white">
                          <span class="pixel-text">CONNECT</span>
                        </span>`
                          : `<span class="arcade-btn bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs text-white">
                          <span class="pixel-text">INSTALL</span>
                        </span>`
                      }
                    </div>
                  </button>
                `;
                })
                .join("")}
            </div>
            <div class="mt-6 text-xs text-center text-gray-400 px-2 pixel-text">
              BY CONNECTING, YOU ACCEPT TERMS OF SERVICE
            </div>
          </div>
        </div>
      `;

      (window as any).showFrameModal(modalHTML);

      return () => {
        if (!isModalOpen) {
          (window as any).hideFrameModal();
        }
      };
    } else {
      (window as any).hideFrameModal();
    }
  }, [isModalOpen, account, connected]);

  // Reset copy status after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      show: true,
      message,
      type,
    });

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

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
        showToast(`Connected to ${option.name} successfully`, "success");
      }
      // Add other wallet connect implementations as needed

      setIsModalOpen(false);
    } catch (error) {
      console.error(`Failed to connect to ${option.name}:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to connect to ${option.name}`;
      showToast(`Error: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      // Close the modal immediately to prevent UI issues
      setIsModalOpen(false);

      await disconnect();
      setActiveWallet(null);
      console.log("Wallet disconnected successfully");

      showToast("Wallet disconnected successfully", "success");
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      showToast(
        `Failed to disconnect: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
  };

  // Listen for iframe events
  useEffect(() => {
    // Handle connect wallet from iframe
    const handleConnectWalletFromIframe = (
      event: CustomEvent<{ walletId: string }>
    ) => {
      const walletId = event.detail.walletId;
      const option = walletOptions.find((opt) => opt.id === walletId);
      if (option) {
        handleConnectWallet(option);
      }
    };

    // Handle copy address from iframe
    const handleCopyAddressFromIframe = () => {
      if (account) {
        copyToClipboard(account.address);
      }
    };

    // Handle open explorer from iframe
    const handleOpenExplorerFromIframe = () => {
      if (account) {
        window.open(
          `https://explorer.aptoslabs.com/account/${account.address}`,
          "_blank"
        );
        setIsModalOpen(false);
      }
    };

    // Handle disconnect from iframe
    const handleDisconnectFromIframe = () => {
      handleDisconnect();
    };

    // Add event listeners
    document.addEventListener(
      "iframe-connect-wallet",
      handleConnectWalletFromIframe as EventListener
    );
    document.addEventListener(
      "iframe-copy-address",
      handleCopyAddressFromIframe as EventListener
    );
    document.addEventListener(
      "iframe-open-explorer",
      handleOpenExplorerFromIframe as EventListener
    );
    document.addEventListener(
      "iframe-disconnect-wallet",
      handleDisconnectFromIframe as EventListener
    );

    // Clean up
    return () => {
      document.removeEventListener(
        "iframe-connect-wallet",
        handleConnectWalletFromIframe as EventListener
      );
      document.removeEventListener(
        "iframe-copy-address",
        handleCopyAddressFromIframe as EventListener
      );
      document.removeEventListener(
        "iframe-open-explorer",
        handleOpenExplorerFromIframe as EventListener
      );
      document.removeEventListener(
        "iframe-disconnect-wallet",
        handleDisconnectFromIframe as EventListener
      );
    };
  }, [
    account,
    walletOptions,
    handleConnectWallet,
    handleDisconnect,
    copyToClipboard,
    showToast,
  ]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If already connected, show account info
  if (account && connected) {
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(!isModalOpen);
          }}
          className="arcade-btn bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 text-sm relative group"
        >
          <span className="relative z-10 pixel-text">
            {truncateAddress(account.address)}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </button>

        {isModalOpen && (
          <>
            {/* Modal Backdrop for mobile and desktop */}
            <div
              className="fixed inset-0 bg-black/50 z-[999999] modal-overlay"
              onClick={() => setIsModalOpen(false)}
            />
            <div
              ref={modalRef}
              className="fixed right-4 top-16 md:absolute md:right-0 md:top-auto md:mt-2 w-72 bg-gray-900 border-2 border-indigo-500 rounded-lg shadow-2xl z-[9999999] overflow-hidden transition-all duration-200 animate-fade-in pixelated-shadow pixel-pattern modal-content"
              style={{ animation: "fadeIn 0.2s ease-out" }}
            >
              <div className="p-4 border-b-2 border-indigo-500 bg-gradient-to-r from-indigo-900/40 to-purple-900/40">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-700 border-2 border-indigo-400">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white pixel-text">
                      WALLET
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      {truncateAddress(account.address)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border-b-2 border-indigo-500/50">
                <button
                  onClick={() => copyToClipboard(account.address)}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors duration-150"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-3 text-green-500" />
                      <span className="pixel-text">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="pixel-text">COPY ADDRESS</span>
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
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors duration-150 mt-1"
                >
                  <ExternalLink className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="pixel-text">VIEW ON EXPLORER</span>
                </button>
              </div>

              <div className="p-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Stop event from bubbling up
                    handleDisconnect();
                  }}
                  disabled={isLoading}
                  className="arcade-btn bg-red-600 hover:bg-red-500 text-white px-3 py-2 text-sm w-full relative group"
                  data-testid="disconnect-wallet-btn"
                >
                  {isLoading ? (
                    <span className="animate-pulse pixel-text">
                      DISCONNECTING...
                    </span>
                  ) : (
                    <span className="relative z-10 pixel-text">DISCONNECT</span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>
          </>
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
        className="arcade-btn bg-indigo-700 hover:bg-indigo-600 text-white px-5 py-2.5 text-sm relative group"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-pulse pixel-text">CONNECTING...</div>
          </div>
        ) : (
          <span className="relative z-10 pixel-text">CONNECT WALLET</span>
        )}
        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[999999] modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border-2 border-indigo-500 rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in z-[9999999] relative pixelated-shadow pixel-pattern modal-content"
            style={{ animation: "scaleIn 0.2s ease-out" }}
          >
            <div className="p-6 border-b-2 border-indigo-500 bg-gradient-to-r from-indigo-900/40 to-purple-900/40">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white pixel-text">
                  CONNECT WALLET
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-indigo-300 transition-colors duration-150 pixel-text"
                >
                  X
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-300">
                Connect your wallet to access this application and interact with
                the Aptos blockchain.
              </p>
            </div>

            <div className="p-6 max-h-80 overflow-y-auto bg-gray-800">
              <div className="space-y-4">
                {walletOptions.map((option) => {
                  const isInstalled = option.checkInstalled();

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleConnectWallet(option)}
                      className="flex items-center justify-between w-full p-4 border-2 border-indigo-500/50 bg-gray-900 hover:border-indigo-400 hover:bg-gray-800 transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 border-2 border-indigo-500/30 overflow-hidden mr-4 bg-gray-800 p-2 flex items-center justify-center">
                          {option.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white pixel-text">
                            {option.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div>
                        {isInstalled ? (
                          <span className="arcade-btn bg-indigo-700 hover:bg-indigo-600 px-3 py-1 text-xs text-white">
                            <span className="pixel-text">CONNECT</span>
                          </span>
                        ) : (
                          <span className="arcade-btn bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs text-white">
                            <span className="pixel-text">INSTALL</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 text-xs text-center text-gray-400 px-2 pixel-text">
                BY CONNECTING, YOU ACCEPT TERMS OF SERVICE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast.show && (
        <div
          className={`toast-notification pixel-text ${
            toast.type === "success" ? "toast-success" : "toast-error"
          } border-2 ${
            toast.type === "success" ? "border-green-600" : "border-red-600"
          }`}
        >
          <div className="flex items-center">
            {toast.type === "success" ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{toast.message.toUpperCase()}</span>
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
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WalletConnectButton;
