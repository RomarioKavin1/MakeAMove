// src/lib/hexUtils.ts
import { CardInstance } from "@/types/Card";
import { Position } from "@/types/Game";
import { HexTile, TerrainType } from "@/types/Terrain";

// Calculate pixel position from hex coordinates
// Using axial coordinates for perfect hexagon tiling
export const calculateHexPosition = (position: Position, size: number) => {
  // Constants for perfect hexagon tiling
  // Width of a hexagon is 2*size
  // Height of a hexagon is sqrt(3)*size
  const width = size * 2;
  const height = size * Math.sqrt(3);

  // For flat-topped hexagons that perfectly share edges:
  const x = position.q * ((width * 3) / 4); // Each column is offset by 3/4 of the width
  const y = position.r * height + (position.q % 2) * (height / 2); // Odd columns are offset vertically

  return { x, y };
};

// Get all neighboring hex positions
export const getNeighbors = (position: Position): Position[] => {
  // Different neighbor patterns for even and odd columns
  const directions =
    position.q % 2 === 0
      ? // Even q
        [
          { q: 1, r: 0 }, // right
          { q: 0, r: 1 }, // bottom right
          { q: -1, r: 1 }, // bottom left
          { q: -1, r: 0 }, // left
          { q: -1, r: -1 }, // top left
          { q: 0, r: -1 }, // top right
        ]
      : // Odd q
        [
          { q: 1, r: 0 }, // right
          { q: 1, r: 1 }, // bottom right
          { q: 0, r: 1 }, // bottom left
          { q: -1, r: 0 }, // left
          { q: 0, r: -1 }, // top left
          { q: 1, r: -1 }, // top right
        ];

  return directions.map((dir) => ({
    q: position.q + dir.q,
    r: position.r + dir.r,
  }));
};

// Check if position is within grid bounds
export const isInBounds = (position: Position, gridSize: number): boolean => {
  // For a rectangular grid with width of 5 and height of 10
  return (
    position.q >= -2 &&
    position.q <= 2 && // 5 columns (-2 to 2)
    position.r >= -5 &&
    position.r <= 4
  ); // 10 rows (-5 to 4)
};

// Get the distance between two hex positions
export const getHexDistance = (a: Position, b: Position): number => {
  // In this coordinate system, we need to convert to cube coordinates first
  const ax = a.q;
  const az = a.r - (a.q - (a.q % 2)) / 2;
  const ay = -ax - az;

  const bx = b.q;
  const bz = b.r - (b.q - (b.q % 2)) / 2;
  const by = -bx - bz;

  return Math.max(Math.abs(ax - bx), Math.abs(ay - by), Math.abs(az - bz));
};

// Find all possible move positions for a unit
export const getPossibleMoves = (
  unit: CardInstance,
  tiles: HexTile[],
  gridSize: number
): Position[] => {
  if (!unit.position) return [];

  const visited = new Set<string>();
  const possibleMoves: Position[] = [];
  const queue: { pos: Position; movesLeft: number }[] = [
    { pos: unit.position, movesLeft: unit.movementRange },
  ];

  while (queue.length > 0) {
    const { pos, movesLeft } = queue.shift()!;
    const posKey = `${pos.q},${pos.r}`;

    // Skip if already visited
    if (visited.has(posKey)) continue;
    visited.add(posKey);

    // Current tile is a valid move position (if not the starting position)
    if (posKey !== `${unit.position.q},${unit.position.r}`) {
      possibleMoves.push(pos);
    }

    // If no moves left, don't explore further
    if (movesLeft <= 0) continue;

    // Check neighbors
    const neighbors = getNeighbors(pos);
    for (const neighbor of neighbors) {
      // Ensure neighbor is in bounds
      if (!isInBounds(neighbor, gridSize)) continue;

      // Find the neighbor tile
      const neighborTile = tiles.find(
        (tile) =>
          tile.position.q === neighbor.q && tile.position.r === neighbor.r
      );

      // Skip if no tile found or tile is impassable
      if (!neighborTile || !neighborTile.terrain.isPassable) continue;

      // Skip if occupied by another unit
      if (neighborTile.unit) continue;

      // Calculate movement cost based on terrain
      const movementCost = neighborTile.terrain.movementCost;

      // Check for terrain-specific movement penalties for this unit type
      const terrainEffect = unit.terrainEffects.find(
        (effect) => effect.type === neighborTile.terrain.type
      );
      const totalMovementCost =
        movementCost + (terrainEffect?.movementPenalty || 0);

      // Add to queue if we have enough movement left
      if (movesLeft >= totalMovementCost) {
        queue.push({
          pos: neighbor,
          movesLeft: movesLeft - totalMovementCost,
        });
      }
    }
  }

  return possibleMoves;
};

// Find all possible attack targets for a unit
export const getPossibleAttackTargets = (
  unit: CardInstance,
  tiles: HexTile[],
  gridSize: number
): Position[] => {
  if (!unit.position) return [];

  const targets: Position[] = [];

  // Get all tiles within attack range
  const tilesInRange: HexTile[] = [];

  // For each tile, check if it's within range
  tiles.forEach((tile) => {
    const distance = getHexDistance(unit.position!, tile.position);
    if (distance <= unit.range && distance > 0) {
      tilesInRange.push(tile);
    }
  });

  // Check each tile for enemy units or fortresses
  tilesInRange.forEach((tile) => {
    // If the tile has an enemy unit
    if (tile.unit && isEnemy(unit, tile.unit)) {
      targets.push(tile.position);
    }

    // If the tile has an enemy fortress
    if (tile.fortress && isEnemyFortress(unit, tile.fortress)) {
      targets.push(tile.position);
    }
  });

  return targets;
};

// Helper function to check if a unit is an enemy
const isEnemy = (unit1: CardInstance, unit2: CardInstance): boolean => {
  // For this simple version, we'll determine ownership by position (q value)
  // Player units have negative q, AI units have positive q
  const isUnit1Player = unit1.position!.q < 0;
  const isUnit2Player = unit2.position!.q < 0;

  return isUnit1Player !== isUnit2Player;
};

// Helper function to check if a fortress is an enemy fortress
const isEnemyFortress = (unit: CardInstance, fortress: any): boolean => {
  // Player units should attack AI fortresses and vice versa
  const isUnitPlayer = unit.position!.q < 0;
  return isUnitPlayer ? fortress.owner === "ai" : fortress.owner === "player";
};

// Create a simplified hex grid for 5x10 battlefield
export const generateHexGrid = (gridSize: number): HexTile[] => {
  const tiles: HexTile[] = [];
  const terrainTypes: TerrainType[] = [
    "plains",
    "forest",
    "mountain",
    "water",
    "desert",
    "swamp",
  ];

  // Define terrain properties
  const terrainProperties = {
    plains: {
      movementCost: 1,
      defenseBonus: 0,
      attackBonus: 0,
      isPassable: true,
      imageUrl: "/assets/terrains/plains.png",
    },
    forest: {
      movementCost: 2,
      defenseBonus: 1,
      attackBonus: 0,
      isPassable: true,
      imageUrl: "/assets/terrains/forest.png",
    },
    mountain: {
      movementCost: 3,
      defenseBonus: 2,
      attackBonus: 1,
      isPassable: true,
      imageUrl: "/assets/terrains/mountain.png",
    },
    water: {
      movementCost: 2,
      defenseBonus: 0,
      attackBonus: 0,
      isPassable: false,
      imageUrl: "/assets/terrains/water.png",
    },
    desert: {
      movementCost: 2,
      defenseBonus: 0,
      attackBonus: 0,
      isPassable: true,
      imageUrl: "/assets/terrains/desert.png",
    },
    swamp: {
      movementCost: 3,
      defenseBonus: 1,
      attackBonus: -1,
      isPassable: true,
      imageUrl: "/assets/terrains/swamp.png",
    },
    healing: {
      movementCost: 1,
      defenseBonus: 0,
      attackBonus: 0,
      isPassable: true,
      healAmount: 2,
      imageUrl: "/assets/terrains/healing.png",
    },
  };

  // Create a 5x10 grid
  // q from -2 to 2 (5 columns)
  // r from -5 to 4 (10 rows)
  for (let q = -2; q <= 2; q++) {
    for (let r = -5; r <= 4; r++) {
      // Create a new tile at this position
      const position = { q, r };

      // Determine terrain type
      let terrainType: TerrainType;

      // Create distinct zones for player and AI sides
      if (q < 0) {
        // Player side (negative q) - more forests and plains
        terrainType = Math.random() > 0.7 ? "forest" : "plains";
      } else if (q > 0) {
        // AI side (positive q) - more desert and mountain
        terrainType = Math.random() > 0.7 ? "desert" : "plains";
      } else {
        // Middle column - mixed terrain with some water obstacles
        terrainType = Math.random() > 0.7 ? "water" : "plains";
      }

      // Add healing tiles (one per side)
      if ((q == -2 && r == -2) || (q == 2 && r == 2)) {
        terrainType = "healing";
      }

      // Create the tile
      tiles.push({
        position,
        terrain: {
          type: terrainType,
          ...terrainProperties[terrainType],
        },
      });
    }
  }

  return tiles;
};
