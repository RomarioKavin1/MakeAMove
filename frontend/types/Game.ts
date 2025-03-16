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

export interface Fortress {
  id: string;
  owner: "player" | "ai";
  health: number;
  maxHealth: number;
  position: Position;
}

export type TerrainType =
  | "plains"
  | "forest"
  | "mountain"
  | "water"
  | "desert"
  | "swamp"
  | "healing";

export type Terrain = {
  type: TerrainType;
  movementCost: number;
  defenseBonus: number;
  attackBonus: number;
  isPassable: boolean;
  healAmount?: number;
  imageUrl: string;
};

export type HexTile = {
  position: Position;
  terrain: Terrain;
  unit?: any; // CardInstance - defined to avoid circular imports
  fortress?: Fortress;
};
