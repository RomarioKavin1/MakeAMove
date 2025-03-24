import { Card } from "./Card";
import { CardInstance } from "./Card";

// src/types/Game.ts
export type Position = {
  q: number; // Hex grid coordinates
  r: number;
};

export type GameState = {
  turn: number;
  maxTurns: number;
  currentPlayer: "player" | "ai";
  phase: "setup" | "battle" | "complete";
  winner: "player" | "ai" | null;
  startTime?: number;
  gameId?: string;
};

export type AnimationState = "idle" | "attack" | "walk";
export type AnimationDirection = "left" | "right";

export interface UnitAnimation {
  state: AnimationState;
  target?: Position;
  direction: AnimationDirection;
}

export type CardInstance = Card & {
  instanceId: string;
  position: Position | null;
  canAct: boolean;
  hasAttacked: boolean;
  hasMoved: boolean;
  owner: "player" | "ai"; // This is the property being added
};

export interface Fortress {
  id: string;
  health: number;
  maxHealth: number;
  owner: "player" | "ai";
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
