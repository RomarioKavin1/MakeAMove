// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
import { GameProvider } from "@/context/GameContext";
import { PetraWalletProvider } from "@/context/WalletProvider";
import WalletConnectButton from "@/components/petra/ConnectButton";

// Keep the Inter font for normal text
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Add Press Start 2P font for pixel text
const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata = {
  title: "MakeAMove - Tactical Blockchain Strategy Game",
  description:
    "A hexagonal grid strategy game with NFT cards and blockchain integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="/js/fix-modal.js" async></script>
        <style>{`
          #modal-frame {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            pointer-events: none;
            z-index: 2147483647;
          }
        `}</style>
      </head>
      <body className={`${inter.variable} ${pixelFont.variable} arcade-mode`}>
        <PetraWalletProvider>
          <GameProvider>{children}</GameProvider>
        </PetraWalletProvider>
        <div
          id="modal-root"
          style={{ position: "relative", zIndex: 2147483647 }}
        ></div>
        <iframe id="modal-frame" title="Modal Container"></iframe>
      </body>
    </html>
  );
}
