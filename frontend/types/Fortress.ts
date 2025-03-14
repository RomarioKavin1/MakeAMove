import { Position } from "./Game";

export type Fortress = {
  id: string;
  owner: "player" | "ai";
  health: number;
  maxHealth: number;
  position: Position;
};
