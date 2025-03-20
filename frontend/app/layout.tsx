// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { GameProvider } from "@/context/GameContext";
import { PetraWalletProvider } from "@/context/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <PetraWalletProvider>
          <GameProvider>{children}</GameProvider>
        </PetraWalletProvider>
      </body>
    </html>
  );
}
