import {
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  HexInput,
  Network,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import inquirer from "inquirer";

// Import your game types
import { GameState, HexTile, Position, TerrainType } from "./types/Game";
import { Card, CardInstance, CardType } from "./types/Card";
import {
  getPossibleMoves,
  getPossibleAttackTargets,
} from "../../frontend/lib/hexUtils";

// Sample game state for testing
const createSampleGameState = (): GameState => {
  return {
    turn: 1,
    maxTurns: 20,
    currentPlayer: "ai", // Set to AI for testing
    phase: "battle",
    winner: null,
  };
};

// Create sample terrain types
const terrainTypes = {
  plains: {
    type: "plains" as TerrainType,
    movementCost: 1,
    defenseBonus: 0,
    attackBonus: 0,
    isPassable: true,
    imageUrl: "/terrains/plains.png",
  },
  forest: {
    type: "forest" as TerrainType,
    movementCost: 2,
    defenseBonus: 2,
    attackBonus: 0,
    isPassable: true,
    imageUrl: "/terrains/forest.png",
  },
  mountain: {
    type: "mountain" as TerrainType,
    movementCost: 3,
    defenseBonus: 3,
    attackBonus: 1,
    isPassable: true,
    imageUrl: "/terrains/mountain.png",
  },
  water: {
    type: "water" as TerrainType,
    movementCost: 999,
    defenseBonus: 0,
    attackBonus: 0,
    isPassable: false,
    imageUrl: "/terrains/water.png",
  },
  healing: {
    type: "healing" as TerrainType,
    movementCost: 1,
    defenseBonus: 0,
    attackBonus: 0,
    isPassable: true,
    healAmount: 5,
    imageUrl: "/terrains/healing.png",
  },
};

// Create sample hex grid
const createSampleGrid = (size: number): HexTile[] => {
  const tiles: HexTile[] = [];

  for (let q = -size; q <= size; q++) {
    const r1 = Math.max(-size, -q - size);
    const r2 = Math.min(size, -q + size);

    for (let r = r1; r <= r2; r++) {
      // Randomly select a terrain type
      const terrainKeys = Object.keys(terrainTypes);
      const randomTerrain =
        terrainTypes[
          terrainKeys[
            Math.floor(Math.random() * terrainKeys.length)
          ] as keyof typeof terrainTypes
        ];

      tiles.push({
        position: { q, r },
        terrain: randomTerrain,
      });
    }
  }

  // Place player fortress
  const playerFortressIndex = tiles.findIndex(
    (tile) => tile.position.q === -size + 1 && tile.position.r === size - 1
  );

  if (playerFortressIndex !== -1) {
    tiles[playerFortressIndex].fortress = {
      id: "player-fortress",
      owner: "player",
      health: 100,
      maxHealth: 100,
      position: tiles[playerFortressIndex].position,
    };
  }

  // Place AI fortress
  const aiFortressIndex = tiles.findIndex(
    (tile) => tile.position.q === size - 1 && tile.position.r === -size + 1
  );

  if (aiFortressIndex !== -1) {
    tiles[aiFortressIndex].fortress = {
      id: "ai-fortress",
      owner: "ai",
      health: 100,
      maxHealth: 100,
      position: tiles[aiFortressIndex].position,
    };
  }

  return tiles;
};

// Create sample units
const createSampleCards = (): Card[] => {
  return [
    {
      id: "card-1",
      name: "Swordsman",
      type: "warrior" as CardType,
      description: "Basic melee unit",
      imageUrl: "/cards/warrior.png",
      rarity: "common",
      attack: 10,
      health: 30,
      maxHealth: 30,
      range: 1,
      movementRange: 2,
      terrainEffects: [
        { type: "forest" as TerrainType, defenseBonus: 1 },
        { type: "mountain" as TerrainType, movementPenalty: 1 },
      ],
      targetBonuses: [{ targetType: "mage", attackBonus: 2 }],
    },
    {
      id: "card-2",
      name: "Archer",
      type: "archer" as CardType,
      description: "Ranged attacker",
      imageUrl: "/cards/archer.png",
      rarity: "uncommon",
      attack: 8,
      health: 20,
      maxHealth: 20,
      range: 3,
      movementRange: 2,
      terrainEffects: [{ type: "mountain" as TerrainType, attackBonus: 2 }],
      targetBonuses: [{ targetType: "warrior", attackBonus: 1 }],
    },
    {
      id: "card-3",
      name: "Healer",
      type: "healer" as CardType,
      description: "Support unit that can heal allies",
      imageUrl: "/cards/healer.png",
      rarity: "rare",
      attack: 4,
      health: 15,
      maxHealth: 15,
      range: 2,
      movementRange: 2,
      terrainEffects: [{ type: "healing" as TerrainType, defenseBonus: 2 }],
      targetBonuses: [],
      specialAbility: {
        name: "Heal",
        description: "Heal an adjacent unit for 5 health",
        cooldown: 1,
        currentCooldown: 0,
      },
    },
    {
      id: "card-4",
      name: "Tank",
      type: "tank" as CardType,
      description: "High health defensive unit",
      imageUrl: "/cards/tank.png",
      rarity: "rare",
      attack: 6,
      health: 50,
      maxHealth: 50,
      range: 1,
      movementRange: 1,
      terrainEffects: [
        { type: "mountain" as TerrainType, defenseBonus: 3 },
        { type: "water" as TerrainType, movementPenalty: 2 },
      ],
      targetBonuses: [{ targetType: "fortress", attackBonus: 3 }],
    },
  ];
};

// Create card instances from cards
const createCardInstance = (
  card: Card,
  owner: "player" | "ai",
  position?: Position
): CardInstance => {
  return {
    ...card,
    instanceId: Math.random().toString(36).substring(2, 15),
    position: position || null,
    canAct: true,
    hasAttacked: false,
    hasMoved: false,
    owner,
  };
};

// AI Game Agent class
class GameAI {
  private gameState: GameState;
  private tiles: HexTile[];
  private gridSize: number;

  constructor(gameState: GameState, tiles: HexTile[], gridSize: number) {
    this.gameState = gameState;
    this.tiles = tiles;
    this.gridSize = gridSize;
  }

  // Find all AI units on the board
  private getAIUnits(): CardInstance[] {
    const aiUnits: CardInstance[] = [];

    this.tiles.forEach((tile) => {
      if (tile.unit && tile.unit.owner === "ai") {
        aiUnits.push(tile.unit);
      }
    });

    return aiUnits;
  }

  // Find all player units on the board
  private getPlayerUnits(): CardInstance[] {
    const playerUnits: CardInstance[] = [];

    this.tiles.forEach((tile) => {
      if (tile.unit && tile.unit.owner === "player") {
        playerUnits.push(tile.unit);
      }
    });

    return playerUnits;
  }

  // Determine the best move for the AI
  public determineNextMove(): {
    action: string;
    data: any;
    explanation: string;
  } {
    const aiUnits = this.getAIUnits();

    // First priority: Attack player units or fortress if possible
    for (const unit of aiUnits) {
      if (unit.hasAttacked || !unit.position) continue;

      const attackTargets = getPossibleAttackTargets(
        unit,
        this.tiles,
        this.gridSize
      );

      if (attackTargets.length > 0) {
        // First target player fortresses if in range
        let bestTarget = null;
        let bestTargetDescription = "";

        for (const pos of attackTargets) {
          const targetTile = this.tiles.find(
            (t) => t.position.q === pos.q && t.position.r === pos.r
          );

          if (targetTile?.fortress && targetTile.fortress.owner === "player") {
            bestTarget = pos;
            bestTargetDescription = "player fortress";
            break;
          }
        }

        // If no fortress in range, prioritize vulnerable units
        if (!bestTarget) {
          let bestScore = -1;

          for (const pos of attackTargets) {
            const targetTile = this.tiles.find(
              (t) => t.position.q === pos.q && t.position.r === pos.r
            );

            if (targetTile?.unit && targetTile.unit.owner === "player") {
              // Score targets by health and type
              const healthScore =
                1 - targetTile.unit.health / targetTile.unit.maxHealth;
              let typeScore = 0;

              // Prioritize healers, then archers, etc.
              if (targetTile.unit.type === "healer") typeScore = 5;
              else if (targetTile.unit.type === "archer") typeScore = 4;
              else if (targetTile.unit.type === "mage") typeScore = 3;
              else if (targetTile.unit.type === "scout") typeScore = 2;
              else if (targetTile.unit.type === "warrior") typeScore = 1;
              else if (targetTile.unit.type === "tank") typeScore = 0.5;

              const score = typeScore + healthScore;

              if (score > bestScore) {
                bestScore = score;
                bestTarget = pos;
                bestTargetDescription = `${targetTile.unit.type} (${targetTile.unit.health}/${targetTile.unit.maxHealth} HP)`;
              }
            }
          }
        }

        if (bestTarget) {
          return {
            action: "attack",
            data: {
              unit: unit,
              targetPosition: bestTarget,
            },
            explanation: `Attacking ${bestTargetDescription} with ${unit.name} at (${unit.position.q},${unit.position.r})`,
          };
        }
      }
    }

    // Second priority: Move units toward player assets
    for (const unit of aiUnits) {
      if (unit.hasMoved || !unit.position) continue;

      const possibleMoves = getPossibleMoves(unit, this.tiles, this.gridSize);

      if (possibleMoves.length > 0) {
        // Find player fortress position
        const playerFortress = this.tiles.find(
          (t) => t.fortress && t.fortress.owner === "player"
        );
        const playerUnits = this.getPlayerUnits();

        let targetPosition = null;
        let explanation = "";

        if (playerFortress) {
          // Choose move that gets closest to player fortress
          targetPosition = this.getMoveTowardTarget(
            unit,
            possibleMoves,
            playerFortress.position
          );
          explanation = `Moving ${unit.name} toward player fortress`;
        } else if (playerUnits.length > 0) {
          // Choose move that gets closest to nearest player unit
          let nearestUnit = playerUnits[0];
          let minDistance = this.calculateDistance(
            unit.position,
            nearestUnit.position!
          );

          playerUnits.forEach((playerUnit) => {
            if (!playerUnit.position) return;
            const distance = this.calculateDistance(
              unit.position!,
              playerUnit.position
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestUnit = playerUnit;
            }
          });

          targetPosition = this.getMoveTowardTarget(
            unit,
            possibleMoves,
            nearestUnit.position!
          );
          explanation = `Moving ${unit.name} toward ${nearestUnit.type}`;
        } else {
          // No player assets, move to a random position
          targetPosition =
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          explanation = `Moving ${unit.name} strategically`;
        }

        if (targetPosition) {
          return {
            action: "move",
            data: {
              unit: unit,
              targetPosition: targetPosition,
            },
            explanation: explanation,
          };
        }
      }
    }

    // If no actions possible, end turn
    return {
      action: "endTurn",
      data: null,
      explanation: "Ending turn - no available actions",
    };
  }

  // Helper: Get move that brings unit closest to target
  private getMoveTowardTarget(
    unit: CardInstance,
    possibleMoves: Position[],
    targetPosition: Position
  ): Position {
    let bestMove = possibleMoves[0];
    let minDistance = this.calculateDistance(bestMove, targetPosition);

    possibleMoves.forEach((move) => {
      const distance = this.calculateDistance(move, targetPosition);
      if (distance < minDistance) {
        minDistance = distance;
        bestMove = move;
      }
    });

    return bestMove;
  }

  // Helper: Calculate hex distance between two positions
  private calculateDistance(a: Position, b: Position): number {
    return Math.max(
      Math.abs(a.q - b.q),
      Math.abs(a.r - b.r),
      Math.abs(a.q + a.r - b.q - b.r)
    );
  }
}

// Function to create the AI agent
const createAIGameAgent = async () => {
  const aptosConfig = new AptosConfig({
    network: Network.MAINNET,
  });
  const aptos = new Aptos(aptosConfig);

  // Use environment variable for private key if available
  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    // For testing, generate a random private key if not provided
    privateKey = PrivateKey.generate().toString();
  }

  const account = await aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(
      PrivateKey.formatPrivateKey(
        privateKey as HexInput,
        PrivateKeyVariants.Ed25519
      )
    ),
  });

  const signer = new LocalSigner(account, Network.MAINNET);
  const agentRuntime = new AgentRuntime(signer, aptos, {
    PANORA_API_KEY: process.env.PANORA_API_KEY,
  });

  // Get standard Aptos tools
  const aptosTools = createAptosTools(agentRuntime);

  // Create custom game tools
  const gameTools = [
    {
      name: "analyzeGameState",
      description: "Analyze the current game state and recommend the best move",
      parameters: {
        type: "object",
        properties: {
          gameState: {
            type: "string",
            description: "JSON string of the current game state",
          },
          tiles: {
            type: "string",
            description: "JSON string of the current game tiles",
          },
          gridSize: {
            type: "number",
            description: "Size of the game grid",
          },
        },
        required: ["gameState", "tiles", "gridSize"],
      },
      handler: async ({ gameState, tiles, gridSize }) => {
        try {
          // Parse the input JSON strings
          const parsedGameState = JSON.parse(gameState);
          const parsedTiles = JSON.parse(tiles);

          // Create game AI instance and determine next move
          const gameAI = new GameAI(parsedGameState, parsedTiles, gridSize);
          const nextMove = gameAI.determineNextMove();

          return JSON.stringify(nextMove);
        } catch (error) {
          console.error("Error in analyzeGameState:", error);
          return JSON.stringify({
            action: "error",
            data: null,
            explanation: `Error analyzing game state: ${error}`,
          });
        }
      },
    },
    {
      name: "executeMove",
      description: "Execute a specific game move",
      parameters: {
        type: "object",
        properties: {
          moveType: {
            type: "string",
            description: "Type of move to execute (move, attack, endTurn)",
          },
          unitId: {
            type: "string",
            description: "ID of the unit making the move",
          },
          targetPosition: {
            type: "string",
            description: "JSON string of the target position {q, r}",
          },
        },
        required: ["moveType"],
      },
      handler: async ({ moveType, unitId, targetPosition }) => {
        // This would integrate with your game mechanics
        // For demo purposes, just return confirmation
        return JSON.stringify({
          success: true,
          message: `Executed ${moveType} for unit ${unitId} ${
            targetPosition ? `to position ${targetPosition}` : ""
          }`,
        });
      },
    },
    {
      name: "recordGameOnChain",
      description: "Record game result on the Aptos blockchain",
      parameters: {
        type: "object",
        properties: {
          gameId: {
            type: "string",
            description: "Unique identifier for the game",
          },
          winner: {
            type: "string",
            description: "Winner of the game (player, ai, or draw)",
          },
          turns: {
            type: "number",
            description: "Number of turns played",
          },
        },
        required: ["gameId", "winner", "turns"],
      },
      handler: async ({ gameId, winner, turns }) => {
        // This would integrate with Aptos blockchain
        // For demo purposes, just return confirmation
        return JSON.stringify({
          success: true,
          message: `Game ${gameId} recorded on blockchain. Winner: ${winner}, Turns: ${turns}`,
        });
      },
    },
  ];

  // Combine standard Aptos tools with game tools
  const tools = [...aptosTools, ...gameTools];

  const llm = new ChatAnthropic({
    model: "claude-3-sonnet-20240229",
  });
  const memory = new MemorySaver();

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
        You are an AI agent that plays a hexagonal strategy game on the Aptos blockchain.
        You make strategic decisions about unit movement and attacks to defeat the human player.
        When analyzing the game state, consider:
        1. Unit positioning and health
        2. Fortress defense
        3. Strategic terrain advantages
        4. Attack opportunities
        
        Always explain your reasoning for moves in a clear, concise manner.
        The input json should be properly formatted as a string (IMPORTANT).
      `,
  });

  return {
    agent,
    config: { configurable: { thread_id: "Aptos Game AI Agent" } },
  };
};

// Test function to run the AI agent on a sample game state
export const testAIAgent = async () => {
  console.log("Initializing AI agent test...");

  // Create sample game data
  const gameState = createSampleGameState();
  const gridSize = 5;
  const tiles = createSampleGrid(gridSize);
  const cards = createSampleCards();

  // Place some units on the board for testing
  const aiWarrior = createCardInstance(cards[0], "ai", { q: 2, r: 0 });
  const aiArcher = createCardInstance(cards[1], "ai", { q: 3, r: -1 });
  const playerWarrior = createCardInstance(cards[0], "player", { q: -2, r: 1 });
  const playerHealer = createCardInstance(cards[2], "player", { q: -3, r: 2 });

  // Add units to tiles
  const aiWarriorTileIndex = tiles.findIndex(
    (t) =>
      t.position.q === aiWarrior.position!.q &&
      t.position.r === aiWarrior.position!.r
  );
  if (aiWarriorTileIndex !== -1) {
    tiles[aiWarriorTileIndex].unit = aiWarrior;
  }

  const aiArcherTileIndex = tiles.findIndex(
    (t) =>
      t.position.q === aiArcher.position!.q &&
      t.position.r === aiArcher.position!.r
  );
  if (aiArcherTileIndex !== -1) {
    tiles[aiArcherTileIndex].unit = aiArcher;
  }

  const playerWarriorTileIndex = tiles.findIndex(
    (t) =>
      t.position.q === playerWarrior.position!.q &&
      t.position.r === playerWarrior.position!.r
  );
  if (playerWarriorTileIndex !== -1) {
    tiles[playerWarriorTileIndex].unit = playerWarrior;
  }

  const playerHealerTileIndex = tiles.findIndex(
    (t) =>
      t.position.q === playerHealer.position!.q &&
      t.position.r === playerHealer.position!.r
  );
  if (playerHealerTileIndex !== -1) {
    tiles[playerHealerTileIndex].unit = playerHealer;
  }

  // Initialize the AI agent
  const { agent, config } = await createAIGameAgent();

  console.log("Game AI agent created. Running test with sample game state...");

  // Convert game state and tiles to JSON strings for the agent
  const gameStateJSON = JSON.stringify(gameState);
  const tilesJSON = JSON.stringify(tiles);

  try {
    // Send the game state to the agent for analysis
    const stream = await agent.stream(
      {
        messages: [
          new HumanMessage(
            `Analyze the current game state and make a strategic move. The game state is: ${gameStateJSON} and the tiles are: ${tilesJSON}. The grid size is: ${gridSize}.`
          ),
        ],
      },
      config
    );

    // Process the agent's response
    console.log("AI agent is thinking...");
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        console.log("\nAI Agent Response:");
        console.log(chunk.agent.messages[0].content);
      } else if ("tools" in chunk) {
        console.log("\nTool Response:");
        console.log(chunk.tools.messages[0].content);
      }
    }

    console.log("\nAI agent test completed.");
  } catch (error) {
    console.error("Error running AI agent:", error);
  }
};

// Main function to run the test
export const main = async () => {
  try {
    await testAIAgent();
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

// Error handling
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch((e) => console.log("Error:", e));
}
