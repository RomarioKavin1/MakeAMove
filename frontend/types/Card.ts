import { Position } from "./Game";
import { TerrainType } from "./Terrain";

export type CardType =
  | "warrior"
  | "archer"
  | "healer"
  | "tank"
  | "mage"
  | "scout";

export type TerrainEffect = {
  type: TerrainType;
  attackBonus?: number;
  defenseBonus?: number;
  movementPenalty?: number;
};

export type TargetBonus = {
  targetType: "fortress" | CardType;
  attackBonus: number;
};

export type Card = {
  id: string;
  name: string;
  type: CardType;
  description: string;
  imageUrl: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  attack: number;
  health: number;
  maxHealth: number;
  range: number;
  movementRange: number;
  terrainEffects: TerrainEffect[];
  targetBonuses: TargetBonus[];
  specialAbility?: {
    name: string;
    description: string;
    cooldown: number;
    currentCooldown: number;
  };
};

export type CardInstance = Card & {
  instanceId: string;
  position: Position | null;
  canAct: boolean;
  hasAttacked: boolean;
  hasMoved: boolean;
};
