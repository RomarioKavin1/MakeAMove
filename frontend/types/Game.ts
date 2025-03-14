// src/types/Game.ts
export type Position = {
  q: number; // Hex grid coordinates
  r: number;
};

export type GameState = {
  turn: number;
  maxTurns: number;
  currentPlayer: "player" | "ai";
  phase: "setup" | "battle" | "gameOver";
  winner: "player" | "ai" | null;
};
