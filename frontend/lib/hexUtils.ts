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
  // For a 10x10 grid centered around 0,0
  return (
    position.q >= -5 &&
    position.q <= 4 && // 10 columns (-5 to 4)
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

// Find placement positions for deploying new units (for player)
export const getPlacementPositions = (tiles: HexTile[]): Position[] => {
  const placementPositions: Position[] = [];

  // Get tiles on player side (negative q)
  const playerSideTiles = tiles.filter(
    (tile) =>
      tile.position.q < 0 &&
      tile.terrain.isPassable &&
      !tile.unit &&
      !tile.fortress
  );

  // First priority: positions adjacent to player fortresses
  const fortressTiles = tiles.filter(
    (tile) => tile.fortress && tile.fortress.owner === "player"
  );

  let adjacentPositions: Position[] = [];

  fortressTiles.forEach((fortressTile) => {
    const neighbors = getNeighbors(fortressTile.position);
    neighbors.forEach((neighborPos) => {
      const neighborTile = tiles.find(
        (tile) =>
          tile.position.q === neighborPos.q && tile.position.r === neighborPos.r
      );

      if (
        neighborTile &&
        neighborTile.position.q < 0 &&
        neighborTile.terrain.isPassable &&
        !neighborTile.unit &&
        !neighborTile.fortress
      ) {
        adjacentPositions.push(neighborPos);
      }
    });
  });

  // Remove duplicates
  adjacentPositions = adjacentPositions.filter(
    (pos, index, self) =>
      index === self.findIndex((p) => p.q === pos.q && p.r === pos.r)
  );

  // Add fortress-adjacent positions first
  placementPositions.push(...adjacentPositions);

  // Then add other valid positions on player side
  playerSideTiles.forEach((tile) => {
    if (
      !placementPositions.some(
        (pos) => pos.q === tile.position.q && pos.r === tile.position.r
      )
    ) {
      placementPositions.push(tile.position);
    }
  });

  return placementPositions;
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

// Create terrain types with biome regions for a 10x10 grid
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

  // Create the terrain with biome regions
  // Use simplex noise or other methods to create coherent terrain patterns
  for (let q = -5; q <= 4; q++) {
    for (let r = -5; r <= 4; r++) {
      // Create a new tile at this position
      const position = { q, r };

      // Generate terrain based on position (creating biome regions)
      let terrainType: TerrainType;

      // Simple biome regions
      // Player side (forest/plains biome)
      if (q < -2) {
        terrainType = Math.random() > 0.65 ? "forest" : "plains";
      }
      // Middle contested area (mixed terrain)
      else if (q >= -2 && q <= 1) {
        const rand = Math.random();
        if (rand < 0.5) {
          terrainType = "plains";
        } else if (rand < 0.7) {
          terrainType = "forest";
        } else if (rand < 0.8) {
          terrainType = "mountain";
        } else if (rand < 0.9) {
          terrainType = "water";
        } else {
          terrainType = "swamp";
        }
      }
      // AI side (desert/mountain biome)
      else {
        terrainType = Math.random() > 0.65 ? "desert" : "plains";
      }

      // Create a small river across the middle
      if ((q === 0 || q === -1) && r >= -3 && r <= 2 && Math.random() > 0.5) {
        terrainType = "water";
      }

      // Add healing tiles (one per side in strategic locations)
      if ((q === -4 && r === 0) || (q === 3 && r === 0)) {
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
