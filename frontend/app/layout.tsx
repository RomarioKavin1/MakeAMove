// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
import { GameProvider } from "@/context/GameContext";
import { PetraWalletProvider } from "@/context/WalletProvider";

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
      <body className={`${inter.variable} ${pixelFont.variable} arcade-mode`}>
        <PetraWalletProvider>
          <GameProvider>{children}</GameProvider>
        </PetraWalletProvider>
      </body>
    </html>
  );
}
