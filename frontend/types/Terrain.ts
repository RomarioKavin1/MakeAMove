import { CardInstance } from "./Card";
import { Fortress } from "./Fortress";
import { Position } from "./Game";

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
  unit?: CardInstance;
  fortress?: Fortress;
};
