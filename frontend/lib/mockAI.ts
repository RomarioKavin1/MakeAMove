// src/lib/mockAI.ts
import { CardInstance } from "@/types/Card";
import { performAttack, moveUnit, placeUnit } from "./gameLogic";
import { getPossibleMoves, getPossibleAttackTargets } from "./hexUtils";
import { GameState, Position } from "@/types/Game";
import { HexTile } from "@/types/Terrain";

// Mock AI for playing against during development
export const runMockAI = (
  gameState: GameState,
  tiles: HexTile[],
  aiUnits: CardInstance[],
  aiCards: CardInstance[]
): { tiles: HexTile[]; aiUnits: CardInstance[]; message: string } => {
  // Copy state to avoid mutations
  let updatedTiles = [...tiles];
  let updatedAiUnits = [...aiUnits];
  let message = "";
  const gridSize = Math.max(
    ...tiles.map((tile) =>
      Math.max(Math.abs(tile.position.q), Math.abs(tile.position.r))
    )
  );

  // PHASE 1: DEPLOY NEW UNITS (if AI has cards and there are valid positions)
  if (aiCards.length > 0) {
    const deployCard = aiCards[0]; // Get the first available card

    // Find a suitable position for deployment (near AI fortresses or other AI units)
    const deployPositions = findDeployPositions(tiles, "ai");

    if (deployPositions.length > 0) {
      // Choose a random deploy position
      const deployPos =
        deployPositions[Math.floor(Math.random() * deployPositions.length)];

      // Deploy the unit
      const { tiles: tilesAfterDeploy, unit: deployedUnit } = placeUnit(
        updatedTiles,
        deployCard,
        deployPos
      );
      updatedTiles = tilesAfterDeploy;
      updatedAiUnits.push(deployedUnit);

      message = `AI deployed a ${deployCard.type}`;

      // Return early to simulate turn-based deployment
      return {
        tiles: updatedTiles,
        aiUnits: updatedAiUnits,
        message,
      };
    }
  }

  // PHASE 2: COMMAND EXISTING UNITS
  // Get all AI units on the board
  const aiUnitsOnBoard = findUnitsOnBoard(updatedTiles, "ai");

  // Prioritize attacking if possible
  for (const unit of aiUnitsOnBoard) {
    if (unit.hasAttacked) continue; // Skip units that already attacked

    // Find possible attack targets
    const attackTargets = getPossibleAttackTargets(
      unit,
      updatedTiles,
      gridSize
    );

    if (attackTargets.length > 0) {
      // Choose a target (prioritize fortresses, then units)
      let target: Position | null = null;

      // First, check for player fortresses
      for (const pos of attackTargets) {
        const targetTile = updatedTiles.find(
          (tile) => tile.position.q === pos.q && tile.position.r === pos.r
        );

        if (targetTile?.fortress && targetTile.fortress.owner === "player") {
          target = pos;
          break;
        }
      }

      // If no fortress found, attack any player unit
      if (!target && attackTargets.length > 0) {
        target =
          attackTargets[Math.floor(Math.random() * attackTargets.length)];
      }

      // Perform the attack
      if (target) {
        const {
          tiles: tilesAfterAttack,
          attacker,
          damageDealt,
        } = performAttack(updatedTiles, unit, target);
        updatedTiles = tilesAfterAttack;

        // Update the unit in AI units list
        updatedAiUnits = updatedAiUnits.map((u) =>
          u.instanceId === attacker.instanceId ? attacker : u
        );

        message = `AI attacked with ${unit.type} for ${damageDealt} damage`;

        // Return early to simulate turn-based actions
        return {
          tiles: updatedTiles,
          aiUnits: updatedAiUnits,
          message,
        };
      }
    }
  }

  // Move units if no attacks were possible
  for (const unit of aiUnitsOnBoard) {
    if (unit.hasMoved) continue; // Skip units that already moved

    // Find possible moves
    const possibleMoves = getPossibleMoves(unit, updatedTiles, gridSize);

    if (possibleMoves.length > 0) {
      // Choose a strategic move (move toward player fortresses or units)
      const move = chooseBestMove(unit, possibleMoves, updatedTiles);

      // Perform the move
      const { tiles: tilesAfterMove, unit: movedUnit } = moveUnit(
        updatedTiles,
        unit,
        move
      );
      updatedTiles = tilesAfterMove;

      // Update the unit in AI units list
      updatedAiUnits = updatedAiUnits.map((u) =>
        u.instanceId === movedUnit.instanceId ? movedUnit : u
      );

      message = `AI moved ${unit.type} to (${move.q}, ${move.r})`;

      // Return early to simulate turn-based actions
      return {
        tiles: updatedTiles,
        aiUnits: updatedAiUnits,
        message,
      };
    }
  }

  // If no action was taken, end turn
  message = "AI ended turn";

  return {
    tiles: updatedTiles,
    aiUnits: updatedAiUnits,
    message,
  };
};

// Helper function to find valid positions for deploying new units
const findDeployPositions = (
  tiles: HexTile[],
  owner: "player" | "ai"
): Position[] => {
  const deployPositions: Position[] = [];

  // First, find tiles with AI fortresses
  const fortressTiles = tiles.filter(
    (tile) => tile.fortress && tile.fortress.owner === owner
  );

  // Find empty tiles adjacent to fortresses
  fortressTiles.forEach((fortressTile) => {
    const adjacent = findAdjacentTiles(tiles, fortressTile.position);

    adjacent.forEach((adjTile) => {
      // Check if the tile is empty (no unit) and passable
      if (adjTile.terrain.isPassable && !adjTile.unit && !adjTile.fortress) {
        deployPositions.push(adjTile.position);
      }
    });
  });

  // If no positions near fortresses, find positions near AI units
  if (deployPositions.length === 0) {
    // Find tiles with AI units
    const unitTiles = findUnitsOnBoard(tiles, owner);

    unitTiles.forEach((unit) => {
      if (!unit.position) return;

      const unitTile = tiles.find(
        (tile) =>
          tile.position.q === unit.position!.q &&
          tile.position.r === unit.position!.r
      );

      if (unitTile) {
        const adjacent = findAdjacentTiles(tiles, unitTile.position);

        adjacent.forEach((adjTile) => {
          // Check if the tile is empty and passable
          if (
            adjTile.terrain.isPassable &&
            !adjTile.unit &&
            !adjTile.fortress
          ) {
            deployPositions.push(adjTile.position);
          }
        });
      }
    });
  }

  // If still no positions, find any valid position on AI's side
  if (deployPositions.length === 0) {
    tiles.forEach((tile) => {
      // Determine if tile is on AI's side (positive q values)
      const isAISide =
        owner === "ai" ? tile.position.q > 0 : tile.position.q < 0;

      if (isAISide && tile.terrain.isPassable && !tile.unit && !tile.fortress) {
        deployPositions.push(tile.position);
      }
    });
  }

  return deployPositions;
};

// Find adjacent tiles
const findAdjacentTiles = (tiles: HexTile[], position: Position): HexTile[] => {
  const directions = [
    { q: 1, r: 0 },
    { q: 0, r: 1 },
    { q: -1, r: 1 },
    { q: -1, r: 0 },
    { q: 0, r: -1 },
    { q: 1, r: -1 },
  ];

  return tiles.filter((tile) =>
    directions.some(
      (dir) =>
        tile.position.q === position.q + dir.q &&
        tile.position.r === position.r + dir.r
    )
  );
};

// Find units on the board
const findUnitsOnBoard = (
  tiles: HexTile[],
  owner: "player" | "ai"
): CardInstance[] => {
  const units: CardInstance[] = [];

  tiles.forEach((tile) => {
    if (tile.unit) {
      // For simplicity in this mock, we assume units on the ai's side belong to the ai
      // In a real implementation, units would have an owner property
      const isAIUnit =
        owner === "ai"
          ? tile.position.q > 0 // AI units are on positive q side
          : tile.position.q < 0; // Player units are on negative q side

      if (isAIUnit) {
        units.push(tile.unit);
      }
    }
  });

  return units;
};

// Choose the best move for an AI unit
const chooseBestMove = (
  unit: CardInstance,
  possibleMoves: Position[],
  tiles: HexTile[]
): Position => {
  // Find player fortresses
  const playerFortresses = tiles.filter(
    (tile) => tile.fortress && tile.fortress.owner === "player"
  );

  // If there are player fortresses, move toward them
  if (playerFortresses.length > 0) {
    // Find the closest fortress
    let closestFortress = playerFortresses[0];
    let minDistance = calculateDistance(
      unit.position!,
      closestFortress.position
    );

    playerFortresses.forEach((fortress) => {
      const distance = calculateDistance(unit.position!, fortress.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestFortress = fortress;
      }
    });

    // Find the move that gets closest to the fortress
    let bestMove = possibleMoves[0];
    let bestDistance = calculateDistance(bestMove, closestFortress.position);

    possibleMoves.forEach((move) => {
      const distance = calculateDistance(move, closestFortress.position);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMove = move;
      }
    });

    return bestMove;
  }

  // If no player fortresses, move toward player units
  const playerUnits = tiles.filter(
    (tile) => tile.unit && tile.position.q < 0 // Player units are on negative q side
  );

  if (playerUnits.length > 0) {
    // Find the closest player unit
    let closestUnit = playerUnits[0];
    let minDistance = calculateDistance(unit.position!, closestUnit.position);

    playerUnits.forEach((playerUnit) => {
      const distance = calculateDistance(unit.position!, playerUnit.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestUnit = playerUnit;
      }
    });

    // Find the move that gets closest to the player unit
    let bestMove = possibleMoves[0];
    let bestDistance = calculateDistance(bestMove, closestUnit.position);

    possibleMoves.forEach((move) => {
      const distance = calculateDistance(move, closestUnit.position);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMove = move;
      }
    });

    return bestMove;
  }

  // If no player units or fortresses, choose a random move
  return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
};

// Calculate distance between two positions
const calculateDistance = (a: Position, b: Position): number => {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.q + a.r - b.q - b.r)
  );
};
