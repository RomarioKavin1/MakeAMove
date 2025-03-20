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
import { GameState, Position, HexTile } from "./types/Game";
import { CardInstance } from "./types/Card";

// Create your own LocalSigner and AgentRuntime implementations
class LocalSigner {
  account: any;
  network: Network;

  constructor(account: any, network: Network) {
    this.account = account;
    this.network = network;
  }
}

class AgentRuntime {
  signer: LocalSigner;
  aptos: Aptos;
  options: Record<string, any>;

  constructor(
    signer: LocalSigner,
    aptos: Aptos,
    options: Record<string, any> = {}
  ) {
    this.signer = signer;
    this.aptos = aptos;
    this.options = options;
  }
}

// Create your own createAptosTools function
function createAptosTools(agentRuntime: AgentRuntime) {
  return [
    {
      name: "getAddress",
      description: "Get the wallet address of the agent",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: async () => {
        return agentRuntime.signer.account.accountAddress.toString();
      },
    },
    {
      name: "getBalance",
      description: "Get the APT balance of the agent",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: async () => {
        const balance = await agentRuntime.aptos.getAccountAPTAmount({
          accountAddress: agentRuntime.signer.account.accountAddress,
        });
        return `${balance} APT`;
      },
    },
  ];
}

// Game strategy implementation for AI agent
class GameAI {
  private gameState: GameState;
  private tiles: HexTile[];
  private aiUnits: CardInstance[];
  private playerUnits: CardInstance[];
  private gridSize: number;

  constructor(gameState: GameState, tiles: HexTile[], gridSize: number) {
    this.gameState = gameState;
    this.tiles = tiles;
    this.gridSize = gridSize;
    this.aiUnits = this.findUnitsOnBoard("ai");
    this.playerUnits = this.findUnitsOnBoard("player");
  }

  // Main function to determine AI's next move
  public determineNextMove(): { action: string; data: any } {
    // If it's setup phase, prioritize placing units
    if (this.gameState.phase === "setup") {
      return this.findDeploymentAction();
    }

    // First try to attack if possible
    const attackAction = this.findAttackAction();
    if (attackAction) {
      return attackAction;
    }

    // If no attack is possible, try to move units
    const moveAction = this.findMoveAction();
    if (moveAction) {
      return moveAction;
    }

    // If no action is possible, end turn
    return { action: "endTurn", data: null };
  }

  // Find deployment action for setup phase
  private findDeploymentAction(): { action: string; data: any } {
    const deployPositions = this.findDeployPositions("ai");

    if (deployPositions.length > 0) {
      // Choose a strategic position (preferably near fortresses)
      const deployPos = this.chooseBestDeployPosition(deployPositions);

      return {
        action: "deployUnit",
        data: {
          position: deployPos,
          unitIndex: 0, // Use the first available unit in hand
        },
      };
    }

    return { action: "endTurn", data: null };
  }

  // Find possible attack action
  private findAttackAction(): { action: string; data: any } | null {
    for (const unit of this.aiUnits) {
      if (unit.hasAttacked || !unit.position) continue;

      // Find attack targets
      const attackTargets = this.getPossibleAttackTargets(unit);

      if (attackTargets.length > 0) {
        // Prioritize attacking fortresses
        let bestTarget = null;

        // First look for player fortresses
        for (const pos of attackTargets) {
          const targetTile = this.getTileAtPosition(pos);
          if (targetTile?.fortress && targetTile.fortress.owner === "player") {
            bestTarget = pos;
            break;
          }
        }

        // If no fortress, attack units
        if (!bestTarget && attackTargets.length > 0) {
          // Find the most valuable target (lowest health or highest value)
          bestTarget = this.findMostValuableTarget(attackTargets);
        }

        if (bestTarget) {
          return {
            action: "attack",
            data: {
              attacker: unit,
              targetPosition: bestTarget,
            },
          };
        }
      }
    }

    return null;
  }

  // Find possible movement action
  private findMoveAction(): { action: string; data: any } | null {
    for (const unit of this.aiUnits) {
      if (unit.hasMoved || !unit.position) continue;

      // Find possible moves
      const possibleMoves = this.getPossibleMoves(unit);

      if (possibleMoves.length > 0) {
        // Choose best strategic move
        const bestMove = this.chooseBestMove(unit, possibleMoves);

        return {
          action: "move",
          data: {
            unit: unit,
            targetPosition: bestMove,
          },
        };
      }
    }

    return null;
  }

  // Helper: Find units on the board
  private findUnitsOnBoard(owner: "player" | "ai"): CardInstance[] {
    const units: CardInstance[] = [];

    this.tiles.forEach((tile) => {
      if (tile.unit && tile.unit.owner === owner) {
        units.push(tile.unit);
      }
    });

    return units;
  }

  // Helper: Find valid positions for deploying new units
  private findDeployPositions(owner: "player" | "ai"): Position[] {
    const deployPositions: Position[] = [];

    // First, find tiles with owner's fortresses
    const fortressTiles = this.tiles.filter(
      (tile) => tile.fortress && tile.fortress.owner === owner
    );

    // Find empty adjacent tiles to fortresses
    fortressTiles.forEach((fortressTile) => {
      const adjacent = this.findAdjacentTiles(fortressTile.position);

      adjacent.forEach((adjTile) => {
        if (adjTile.terrain.isPassable && !adjTile.unit && !adjTile.fortress) {
          deployPositions.push(adjTile.position);
        }
      });
    });

    // If no positions near fortresses, check positions near friendly units
    if (deployPositions.length === 0) {
      const unitPositions = owner === "ai" ? this.aiUnits : this.playerUnits;

      unitPositions.forEach((unit) => {
        if (!unit.position) return;

        const adjacent = this.findAdjacentTiles(unit.position);

        adjacent.forEach((adjTile) => {
          if (
            adjTile.terrain.isPassable &&
            !adjTile.unit &&
            !adjTile.fortress
          ) {
            deployPositions.push(adjTile.position);
          }
        });
      });
    }

    // If still no positions, find any valid position on owner's side
    if (deployPositions.length === 0) {
      this.tiles.forEach((tile) => {
        const isOwnerSide =
          owner === "ai" ? tile.position.q > 0 : tile.position.q < 0;

        if (
          isOwnerSide &&
          tile.terrain.isPassable &&
          !tile.unit &&
          !tile.fortress
        ) {
          deployPositions.push(tile.position);
        }
      });
    }

    return deployPositions;
  }

  // Helper: Find adjacent tiles to a position
  private findAdjacentTiles(position: Position): HexTile[] {
    const directions = [
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: -1, r: 1 },
      { q: -1, r: 0 },
      { q: 0, r: -1 },
      { q: 1, r: -1 },
    ];

    return this.tiles.filter((tile) =>
      directions.some(
        (dir) =>
          tile.position.q === position.q + dir.q &&
          tile.position.r === position.r + dir.r
      )
    );
  }

  // Helper: Choose best position for deployment
  private chooseBestDeployPosition(positions: Position[]): Position {
    // Prioritize positions near player fortresses or units for quick attacks
    const playerFortresses = this.tiles.filter(
      (tile) => tile.fortress && tile.fortress.owner === "player"
    );

    if (playerFortresses.length > 0) {
      // Find position closest to a player fortress
      let bestPosition = positions[0];
      let minDistance = this.calculateDistance(
        bestPosition,
        playerFortresses[0].position
      );

      positions.forEach((pos) => {
        playerFortresses.forEach((fortress) => {
          const distance = this.calculateDistance(pos, fortress.position);
          if (distance < minDistance) {
            minDistance = distance;
            bestPosition = pos;
          }
        });
      });

      return bestPosition;
    }

    // If no player fortresses, deploy near AI fortresses for defense
    const aiFortresses = this.tiles.filter(
      (tile) => tile.fortress && tile.fortress.owner === "ai"
    );

    if (aiFortresses.length > 0) {
      let bestPosition = positions[0];
      let minDistance = this.calculateDistance(
        bestPosition,
        aiFortresses[0].position
      );

      positions.forEach((pos) => {
        aiFortresses.forEach((fortress) => {
          const distance = this.calculateDistance(pos, fortress.position);
          if (distance < minDistance) {
            minDistance = distance;
            bestPosition = pos;
          }
        });
      });

      return bestPosition;
    }

    // Default: choose a random position
    return positions[Math.floor(Math.random() * positions.length)];
  }

  // Helper: Find most valuable target to attack
  private findMostValuableTarget(positions: Position[]): Position {
    let bestTarget = positions[0];
    let highestValue = -1;

    positions.forEach((pos) => {
      const tile = this.getTileAtPosition(pos);

      if (tile?.unit) {
        // Calculate target value based on unit type and remaining health
        // Lower health means higher priority
        const healthFactor = 1 - tile.unit.health / tile.unit.maxHealth;
        // Attack bonus based on unit type (can be customized)
        const typeFactor =
          tile.unit.type === "infantry"
            ? 2
            : tile.unit.type === "artillery"
            ? 3
            : 1;

        const targetValue = typeFactor * (1 + healthFactor);

        if (targetValue > highestValue) {
          highestValue = targetValue;
          bestTarget = pos;
        }
      }
    });

    return bestTarget;
  }

  // Helper: Choose best move for a unit
  private chooseBestMove(unit: CardInstance, moves: Position[]): Position {
    // If unit is low on health, consider moving to healing terrain
    if (unit.health < unit.maxHealth * 0.3) {
      for (const move of moves) {
        const tile = this.getTileAtPosition(move);
        if (tile?.terrain.type === "healing") {
          return move;
        }
      }
    }

    // Find player fortresses
    const playerFortresses = this.tiles.filter(
      (tile) => tile.fortress && tile.fortress.owner === "player"
    );

    if (playerFortresses.length > 0) {
      // Move toward closest player fortress
      let bestMove = moves[0];
      let minDistance = this.calculateDistance(
        bestMove,
        playerFortresses[0].position
      );

      moves.forEach((move) => {
        playerFortresses.forEach((fortress) => {
          const distance = this.calculateDistance(move, fortress.position);
          if (distance < minDistance) {
            minDistance = distance;
            bestMove = move;
          }
        });
      });

      return bestMove;
    }

    // If no player fortresses, move toward player units
    if (this.playerUnits.length > 0) {
      let bestMove = moves[0];
      let minDistance = Number.MAX_VALUE;

      this.playerUnits.forEach((playerUnit) => {
        if (!playerUnit.position) return;

        moves.forEach((move) => {
          const distance = this.calculateDistance(move, playerUnit.position!);
          if (distance < minDistance) {
            minDistance = distance;
            bestMove = move;
          }
        });
      });

      return bestMove;
    }

    // Default: random move
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Helper: Get possible attack targets for a unit
  private getPossibleAttackTargets(unit: CardInstance): Position[] {
    // Implementation based on your game rules
    // This is a simplified version using range property instead of attackRange
    if (!unit.position) return [];

    const attackRange = unit.range || 1; // Using range instead of attackRange
    const targets: Position[] = [];

    // Check tiles within attack range
    this.tiles.forEach((tile) => {
      const distance = this.calculateDistance(unit.position!, tile.position);

      if (distance <= attackRange) {
        // Check if tile contains an enemy unit or fortress
        if (
          (tile.unit && tile.unit.owner !== unit.owner) ||
          (tile.fortress && tile.fortress.owner !== unit.owner)
        ) {
          targets.push(tile.position);
        }
      }
    });

    return targets;
  }

  // Helper: Get possible moves for a unit
  private getPossibleMoves(unit: CardInstance): Position[] {
    // Implementation based on your game rules
    if (!unit.position) return [];

    const moveRange = unit.movementRange || 1; // Using movementRange instead of moveRange
    const moves: Position[] = [];

    // Check tiles within move range
    this.tiles.forEach((tile) => {
      const distance = this.calculateDistance(unit.position!, tile.position);

      if (
        distance <= moveRange &&
        distance > 0 && // Can't move to current position
        tile.terrain.isPassable &&
        !tile.unit && // Tile must be empty
        (!tile.fortress || tile.fortress.owner === unit.owner) // Can't move onto enemy fortress
      ) {
        moves.push(tile.position);
      }
    });

    return moves;
  }

  // Helper: Calculate hex distance between two positions
  private calculateDistance(a: Position, b: Position): number {
    return Math.max(
      Math.abs(a.q - b.q),
      Math.abs(a.r - b.r),
      Math.abs(a.q + a.r - b.q - b.r)
    );
  }

  // Helper: Get tile at position
  private getTileAtPosition(position: Position): HexTile | undefined {
    return this.tiles.find(
      (tile) => tile.position.q === position.q && tile.position.r === position.r
    );
  }
}

// Main Aptos AI Agent implementation
export const createGameAIAgent = async () => {
  const aptosConfig = new AptosConfig({
    network: Network.MAINNET,
  });
  const aptos = new Aptos(aptosConfig);
  const account = await aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(
      PrivateKey.formatPrivateKey(
        process.env.PRIVATE_KEY as HexInput,
        PrivateKeyVariants.Ed25519
      )
    ),
  });

  const signer = new LocalSigner(account, Network.MAINNET);
  const agentRuntime = new AgentRuntime(signer, aptos, {
    PANORA_API_KEY: process.env.PANORA_API_KEY,
  });
  const tools = createAptosTools(agentRuntime);

  // Game-specific tools to add to the agent
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
      handler: async ({
        gameState,
        tiles,
        gridSize,
      }: {
        gameState: string;
        tiles: string;
        gridSize: number;
      }) => {
        // Parse the input JSON strings
        const parsedGameState = JSON.parse(gameState);
        const parsedTiles = JSON.parse(tiles);

        // Create game AI instance and determine next move
        const gameAI = new GameAI(parsedGameState, parsedTiles, gridSize);
        const nextMove = gameAI.determineNextMove();

        return JSON.stringify({
          action: nextMove.action,
          data: nextMove.data,
          explanation: `AI is performing ${nextMove.action}`,
        });
      },
    },
    {
      name: "executeGameMove",
      description: "Execute a specific game move",
      parameters: {
        type: "object",
        properties: {
          moveType: {
            type: "string",
            description:
              "Type of move to execute (deploy, move, attack, endTurn)",
          },
          moveData: {
            type: "string",
            description: "JSON string with move details",
          },
        },
        required: ["moveType", "moveData"],
      },
      handler: async ({
        moveType,
        moveData,
      }: {
        moveType: string;
        moveData: string;
      }) => {
        // This would typically integrate with your game's state management
        // For now, we'll just return confirmation
        return `Successfully executed ${moveType} with data: ${moveData}`;
      },
    },
    {
      name: "registerGameResult",
      description: "Register game result on the blockchain",
      parameters: {
        type: "object",
        properties: {
          winner: {
            type: "string",
            description: "Winner of the game (player, ai, or draw)",
          },
          gameStats: {
            type: "string",
            description: "JSON string with game statistics",
          },
        },
        required: ["winner", "gameStats"],
      },
      handler: async ({
        winner,
        gameStats,
      }: {
        winner: string;
        gameStats: string;
      }) => {
        // This would integrate with Aptos blockchain to store game results
        // For the mock, we'll just return confirmation
        return `Game result registered on blockchain. Winner: ${winner}`;
      },
    },
  ];

  // Combine Aptos tools with game-specific tools
  const combinedTools = [...tools, ...gameTools];

  const llm = new ChatAnthropic({
    model: "claude-3-sonnet-20240229",
  });
  const memory = new MemorySaver();

  const agent = createReactAgent({
    llm,
    tools: combinedTools,
    checkpointSaver: memory,
    messageModifier: `
        You are an AI agent that plays a hexagonal strategy game on the Aptos blockchain.
        You make strategic decisions about unit deployment, movement, and attacks to defeat the human player.
        When analyzing the game state, consider:
        1. Unit positioning and health
        2. Fortress defense
        3. Strategic terrain advantages
        4. Attack opportunities
        
        Always explain your reasoning for moves in a clear, concise manner.
        If you encounter blockchain errors, ask the user to try again later.
        
        The input json should be properly formatted as a string (IMPORTANT).
      `,
  });

  return {
    agent,
    config: { configurable: { thread_id: "Aptos Game AI Agent" } },
  };
};

// Example of how to use the AI agent in your game
export const runAIGameTurn = async (
  gameState: GameState,
  tiles: HexTile[],
  gridSize: number
) => {
  const { agent, config } = await createGameAIAgent();

  // Convert objects to JSON strings for the agent
  const gameStateJSON = JSON.stringify(gameState);
  const tilesJSON = JSON.stringify(tiles);

  // Get AI's next move
  const stream = await agent.stream(
    {
      messages: [
        new HumanMessage(
          `Analyze the current game state and make your next move: 
            gameState: ${gameStateJSON}
            tiles: ${tilesJSON}
            gridSize: ${gridSize}`
        ),
      ],
    },
    config
  );

  // Process AI's response
  const responses: string[] = [];
  for await (const chunk of stream) {
    if ("agent" in chunk) {
      responses.push(chunk.agent.messages[0].content);
    } else if ("tools" in chunk) {
      responses.push(chunk.tools.messages[0].content);
    }
  }

  return responses.join("\n");
};

// Main function to set up the game with AI agent
export const main = async () => {
  console.log("Initializing Aptos Game AI Agent...");

  // Set up your game state here
  const gameState: GameState = {
    turn: 1,
    maxTurns: 20,
    currentPlayer: "player",
    phase: "battle",
    winner: null,
  };

  // Example tiles array (simplified)
  const tiles: HexTile[] = [];
  const gridSize = 5;

  // Run the AI agent for a game turn
  const aiResponse = await runAIGameTurn(gameState, tiles, gridSize);
  console.log("AI Agent Decision:", aiResponse);
};

// Error handling
process.on("unhandledRejection", (error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch((e) => console.log("error", e));
}
