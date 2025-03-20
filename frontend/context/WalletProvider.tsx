"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AptosWallet, WalletContextType } from "./types";

// Create context with default values
const PetraWalletContext = createContext<WalletContextType>({
  wallet: null,
  connected: false,
  connecting: false,
  account: null,
  connect: async () => {},
  disconnect: async () => {},
  error: null,
  network: null,
});

export const PetraWalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<AptosWallet | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  // Check if Petra wallet is installed
  useEffect(() => {
    const checkForPetra = () => {
      if (typeof window !== "undefined" && "aptos" in window) {
        setWallet(window.aptos as AptosWallet);
      }
    };

    checkForPetra();
    // Also add event listener for changes (e.g., if user installs Petra during session)
    window.addEventListener("load", checkForPetra);

    return () => {
      window.removeEventListener("load", checkForPetra);
    };
  }, []);

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (wallet) {
        try {
          const isConnected = await wallet.isConnected();
          if (isConnected) {
            const accountInfo = await wallet.account();
            setAccount(accountInfo);
            setConnected(true);

            try {
              const networkInfo = await wallet.network();
              setNetwork(networkInfo.name);
            } catch (e) {
              console.warn("Could not get network info", e);
            }
          }
        } catch (e) {
          console.error("Error checking connection", e);
        }
      }
    };

    checkConnection();
  }, [wallet]);

  // Connect function
  const connect = async (): Promise<void> => {
    if (!wallet) {
      const error = new Error("Petra wallet is not installed");
      setError(error);
      throw error;
    }

    setConnecting(true);
    setError(null);

    try {
      await wallet.connect();
      const accountInfo = await wallet.account();
      setAccount(accountInfo);
      setConnected(true);

      try {
        const networkInfo = await wallet.network();
        setNetwork(networkInfo.name);
      } catch (e) {
        console.warn("Could not get network info", e);
      }
    } catch (e) {
      const error =
        e instanceof Error ? e : new Error("Failed to connect to Petra wallet");
      setError(error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect function
  const disconnect = async () => {
    if (!wallet) return;

    try {
      await wallet.disconnect();
      setConnected(false);
      setAccount(null);
      setNetwork(null);
    } catch (e) {
      const error =
        e instanceof Error
          ? e
          : new Error("Failed to disconnect from Petra wallet");
      setError(error);
      throw error;
    }
  };

  return (
    <PetraWalletContext.Provider
      value={{
        wallet,
        connected,
        connecting,
        account,
        connect,
        disconnect,
        error,
        network,
      }}
    >
      {children}
    </PetraWalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const usePetraWallet = () => useContext(PetraWalletContext);

// utils/wallet.ts
export const getAptosWallet = () => {
  if (typeof window !== "undefined" && "aptos" in window) {
    return window.aptos;
  } else {
    window.open("https://petra.app/", "_blank");
    return null;
  }
};
