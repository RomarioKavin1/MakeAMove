// src/lib/gameLogic.ts
import { GameState, HexTile, Position, Fortress } from "@/types/Game";
import { CardInstance, Card } from "@/types/Card";
import {
  getHexDistance,
  getPossibleMoves,
  getPossibleAttackTargets,
} from "./hexUtils";

// Initialize a new game state
export const initializeGame = (
  playerDeck: Card[],
  gridSize: number,
  tiles: HexTile[],
  maxTurns: number = 20
): GameState => {
  return {
    turn: 1,
    maxTurns,
    currentPlayer: "player",
    phase: "setup",
    winner: null,
  };
};

// Create card instances from cards
export const createCardInstances = (cards: Card[]): CardInstance[] => {
  return cards.map((card) => ({
    ...card,
    instanceId: Math.random().toString(36).substring(2, 15),
    position: null,
    canAct: true,
    hasAttacked: false,
    hasMoved: false,
  }));
};

// Place a fortress at a specific position
export const placeFortress = (
  tiles: HexTile[],
  position: Position,
  owner: "player" | "ai",
  health: number = 100
): HexTile[] => {
  const updatedTiles = [...tiles];
  const tileIndex = updatedTiles.findIndex(
    (tile) => tile.position.q === position.q && tile.position.r === position.r
  );

  if (tileIndex === -1) {
    console.error("Invalid position for fortress placement");
    return tiles;
  }

  // Create the fortress
  const fortress: Fortress = {
    id: Math.random().toString(36).substring(2, 15),
    owner,
    health,
    maxHealth: health,
    position,
  };

  // Update the tile
  updatedTiles[tileIndex] = {
    ...updatedTiles[tileIndex],
    fortress,
  };

  return updatedTiles;
};

// Place a unit at a specific position
export const placeUnit = (
  tiles: HexTile[],
  unit: CardInstance,
  position: Position
): { tiles: HexTile[]; unit: CardInstance } => {
  const updatedTiles = [...tiles];
  const tileIndex = updatedTiles.findIndex(
    (tile) => tile.position.q === position.q && tile.position.r === position.r
  );

  if (tileIndex === -1) {
    console.error("Invalid position for unit placement");
    return { tiles, unit };
  }

  // Check if tile is already occupied
  if (updatedTiles[tileIndex].unit) {
    console.error("Tile is already occupied");
    return { tiles, unit };
  }

  // Update the unit with the new position
  const updatedUnit: CardInstance = {
    ...unit,
    position,
  };

  // Update the tile
  updatedTiles[tileIndex] = {
    ...updatedTiles[tileIndex],
    unit: updatedUnit,
  };

  return { tiles: updatedTiles, unit: updatedUnit };
};

// Move a unit from one position to another
export const moveUnit = (
  tiles: HexTile[],
  unit: CardInstance,
  targetPosition: Position
): { tiles: HexTile[]; unit: CardInstance } => {
  if (!unit.position) {
    console.error("Unit has no current position");
    return { tiles, unit };
  }

  // Clone the tiles array
  const updatedTiles = [...tiles];

  // Find the source and target tile indices
  const sourceTileIndex = updatedTiles.findIndex(
    (tile) =>
      tile.position.q === unit.position!.q &&
      tile.position.r === unit.position!.r
  );

  const targetTileIndex = updatedTiles.findIndex(
    (tile) =>
      tile.position.q === targetPosition.q &&
      tile.position.r === targetPosition.r
  );

  if (sourceTileIndex === -1 || targetTileIndex === -1) {
    console.error("Invalid source or target position");
    return { tiles, unit };
  }

  // Check if target tile is already occupied
  if (updatedTiles[targetTileIndex].unit) {
    console.error("Target tile is already occupied");
    return { tiles, unit };
  }

  // Update the unit with the new position and movement status
  const updatedUnit: CardInstance = {
    ...unit,
    position: targetPosition,
    hasMoved: true,
  };

  // Remove unit from source tile
  updatedTiles[sourceTileIndex] = {
    ...updatedTiles[sourceTileIndex],
    unit: undefined,
  };

  // Add unit to target tile
  updatedTiles[targetTileIndex] = {
    ...updatedTiles[targetTileIndex],
    unit: updatedUnit,
  };

  // Check if target tile is a healing tile
  if (
    updatedTiles[targetTileIndex].terrain.type === "healing" &&
    updatedTiles[targetTileIndex].terrain.healAmount &&
    updatedUnit.health < updatedUnit.maxHealth
  ) {
    // Heal the unit
    const healAmount = updatedTiles[targetTileIndex].terrain.healAmount!;
    const newHealth = Math.min(
      updatedUnit.maxHealth,
      updatedUnit.health + healAmount
    );

    // Update the unit's health
    updatedUnit.health = newHealth;

    // Update the unit on the target tile
    updatedTiles[targetTileIndex].unit = updatedUnit;
  }

  return { tiles: updatedTiles, unit: updatedUnit };
};

// Attack logic
export const performAttack = (
  tiles: HexTile[],
  attacker: CardInstance,
  targetPosition: Position
): { tiles: HexTile[]; attacker: CardInstance; damageDealt: number } => {
  if (!attacker.position) {
    return { tiles: [...tiles], attacker, damageDealt: 0 };
  }

  // Clone the tiles array
  const updatedTiles = [...tiles];

  // Find the target tile
  const targetTileIndex = updatedTiles.findIndex(
    (tile) =>
      tile.position.q === targetPosition.q &&
      tile.position.r === targetPosition.r
  );

  if (targetTileIndex === -1) {
    console.error("Invalid target position");
    return { tiles: updatedTiles, attacker, damageDealt: 0 };
  }

  const targetTile = updatedTiles[targetTileIndex];
  let damageDealt = 0;

  // Calculate base attack damage
  let attackDamage = attacker.attack;

  // Check for terrain attack bonus for attacker
  const attackerTileIndex = updatedTiles.findIndex(
    (tile) =>
      tile.position.q === attacker.position!.q &&
      tile.position.r === attacker.position!.r
  );

  if (attackerTileIndex !== -1) {
    const attackerTile = updatedTiles[attackerTileIndex];
    attackDamage += attackerTile.terrain.attackBonus;

    // Check for terrain-specific attack bonuses
    const terrainEffect = attacker.terrainEffects.find(
      (effect) => effect.type === attackerTile.terrain.type
    );
    if (terrainEffect?.attackBonus) {
      attackDamage += terrainEffect.attackBonus;
    }
  }

  // If attacking an enemy unit
  if (targetTile.unit) {
    const targetUnit = targetTile.unit;

    // Check for target-specific bonuses
    const targetBonus = attacker.targetBonuses.find(
      (bonus) => bonus.targetType === targetUnit.type
    );
    if (targetBonus) {
      attackDamage += targetBonus.attackBonus;
    }

    // Calculate defense value (including terrain bonus)
    let defenseValue = targetTile.terrain.defenseBonus;

    // Check for terrain-specific defense bonuses
    const targetTerrainEffect = targetUnit.terrainEffects.find(
      (effect: { type: string }) => effect.type === targetTile.terrain.type
    );
    if (targetTerrainEffect?.defenseBonus) {
      defenseValue += targetTerrainEffect.defenseBonus;
    }

    // Calculate final damage (minimum 1)
    damageDealt = Math.max(1, attackDamage - defenseValue);

    // Apply damage to the target
    const updatedHealth = Math.max(0, targetUnit.health - damageDealt);

    if (updatedHealth > 0) {
      // Update the target unit's health
      updatedTiles[targetTileIndex] = {
        ...targetTile,
        unit: {
          ...targetUnit,
          health: updatedHealth,
        },
      };
    } else {
      // Remove the defeated unit
      updatedTiles[targetTileIndex] = {
        ...targetTile,
        unit: undefined,
      };
    }
  }
  // If attacking a fortress
  else if (targetTile.fortress) {
    const targetFortress = targetTile.fortress;

    // Check for target-specific bonuses
    const targetBonus = attacker.targetBonuses.find(
      (bonus) => bonus.targetType === "fortress"
    );
    if (targetBonus) {
      attackDamage += targetBonus.attackBonus;
    }

    // Fortresses have fixed defense
    const fortressDefense = 2;

    // Calculate final damage (minimum 1)
    damageDealt = Math.max(1, attackDamage - fortressDefense);

    // Apply damage to the fortress
    const updatedHealth = Math.max(0, targetFortress.health - damageDealt);

    // Update the fortress health
    updatedTiles[targetTileIndex] = {
      ...targetTile,
      fortress: {
        ...targetFortress,
        health: updatedHealth,
      },
    };

    console.log(
      `Fortress at ${targetPosition.q},${targetPosition.r} took ${damageDealt} damage, health now ${updatedHealth}`
    );
  } else {
    // No valid target
    return { tiles: updatedTiles, attacker, damageDealt: 0 };
  }

  // Update attacker status
  const updatedAttacker: CardInstance = {
    ...attacker,
    hasAttacked: true,
  };

  // Update attacker on its tile
  const attackerPositionTileIndex = updatedTiles.findIndex(
    (tile) =>
      tile.position.q === updatedAttacker.position!.q &&
      tile.position.r === updatedAttacker.position!.r
  );

  if (attackerPositionTileIndex !== -1) {
    updatedTiles[attackerPositionTileIndex] = {
      ...updatedTiles[attackerPositionTileIndex],
      unit: updatedAttacker,
    };
  }

  return { tiles: updatedTiles, attacker: updatedAttacker, damageDealt };
};

// Check if game is over
export const checkGameOver = (
  tiles: HexTile[],
  turn: number,
  maxTurns: number
): { isGameOver: boolean; winner: "player" | "ai" | null } => {
  // Count fortresses for each player
  let playerFortresses = 0;
  let playerFortressHealth = 0;
  let aiFortresses = 0;
  let aiFortressHealth = 0;

  tiles.forEach((tile) => {
    if (tile.fortress) {
      if (tile.fortress.owner === "player") {
        playerFortresses++;
        playerFortressHealth += tile.fortress.health;
      } else {
        aiFortresses++;
        aiFortressHealth += tile.fortress.health;
      }
    }
  });

  console.log(
    `Player fortresses: ${playerFortresses}, health: ${playerFortressHealth}`
  );
  console.log(`AI fortresses: ${aiFortresses}, health: ${aiFortressHealth}`);

  // Check if either player has lost all fortresses
  if (playerFortresses === 0) {
    return { isGameOver: true, winner: "ai" };
  }

  if (aiFortresses === 0) {
    return { isGameOver: true, winner: "player" };
  }

  // Check if we've reached the maximum number of turns
  if (turn > maxTurns) {
    // Determine winner based on total fortress health
    if (playerFortressHealth > aiFortressHealth) {
      return { isGameOver: true, winner: "player" };
    } else if (aiFortressHealth > playerFortressHealth) {
      return { isGameOver: true, winner: "ai" };
    } else {
      return { isGameOver: true, winner: null }; // Draw
    }
  }

  // Game is not over
  return { isGameOver: false, winner: null };
};

// Reset units for a new turn
export const resetUnitsForNewTurn = (
  tiles: HexTile[],
  player: "player" | "ai"
): HexTile[] => {
  const updatedTiles = [...tiles];

  updatedTiles.forEach((tile, index) => {
    if (tile.unit) {
      // Determine if this unit belongs to the current player
      // For this simple version, we use position to determine ownership
      const isPlayerUnit = tile.position.q < 0;
      const isCurrentPlayerUnit =
        (player === "player" && isPlayerUnit) ||
        (player === "ai" && !isPlayerUnit);

      if (isCurrentPlayerUnit) {
        updatedTiles[index] = {
          ...tile,
          unit: {
            ...tile.unit,
            canAct: true,
            hasAttacked: false,
            hasMoved: false,
          },
        };
      }
    }
  });

  return updatedTiles;
};

// End player turn and start AI turn
export const endPlayerTurn = (
  gameState: GameState,
  tiles: HexTile[]
): { gameState: GameState; tiles: HexTile[] } => {
  // First check if game is over
  const { isGameOver, winner } = checkGameOver(
    tiles,
    gameState.turn,
    gameState.maxTurns
  );

  if (isGameOver) {
    return {
      gameState: {
        ...gameState,
        phase: "gameOver",
        winner,
      },
      tiles,
    };
  }

  // Switch to AI turn
  const updatedGameState: GameState = {
    ...gameState,
    currentPlayer: "ai",
  };

  return { gameState: updatedGameState, tiles };
};

// End AI turn and start player turn
export const endAITurn = (
  gameState: GameState,
  tiles: HexTile[]
): { gameState: GameState; tiles: HexTile[] } => {
  // First check if game is over
  const { isGameOver, winner } = checkGameOver(
    tiles,
    gameState.turn,
    gameState.maxTurns
  );

  if (isGameOver) {
    return {
      gameState: {
        ...gameState,
        phase: "gameOver",
        winner,
      },
      tiles,
    };
  }

  // Increment turn counter and switch to player turn
  const updatedGameState: GameState = {
    ...gameState,
    turn: gameState.turn + 1,
    currentPlayer: "player",
  };

  // Reset player units for the new turn
  const updatedTiles = resetUnitsForNewTurn(tiles, "player");

  return { gameState: updatedGameState, tiles: updatedTiles };
};

// Animated version of moveUnit that supports callbacks for animation
export const moveUnitWithAnimation = (
  tiles: HexTile[],
  unit: CardInstance,
  targetPosition: Position,
  onStartAnimation: () => void,
  onCompleteAnimation: () => void
): { tiles: HexTile[]; unit: CardInstance } => {
  // Trigger animation start
  onStartAnimation();

  // Regular move logic
  const result = moveUnit(tiles, unit, targetPosition);

  // In a real implementation, you would wait for animation to complete
  // before updating the game state
  setTimeout(() => {
    onCompleteAnimation();
  }, 500); // Animation duration

  return result;
};

// Animated version of performAttack that supports callbacks for animation
export const performAttackWithAnimation = (
  tiles: HexTile[],
  attacker: CardInstance,
  targetPosition: Position,
  onStartAnimation: () => void,
  onCompleteAnimation: () => void
): { tiles: HexTile[]; attacker: CardInstance; damageDealt: number } => {
  // Trigger animation start
  onStartAnimation();

  // Regular attack logic
  const result = performAttack(tiles, attacker, targetPosition);

  // In a real implementation, you would wait for animation to complete
  // before updating the game state
  setTimeout(() => {
    onCompleteAnimation();
  }, 800); // Animation duration

  return result;
};
