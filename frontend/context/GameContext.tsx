"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { Card, CardInstance } from "@/types/Card";
import {
  initializeGame,
  createCardInstances,
  placeFortress,
  placeUnit,
  moveUnit,
  performAttack,
  endPlayerTurn,
  endAITurn,
} from "@/lib/gameLogic";
import {
  generateHexGrid,
  getPossibleMoves,
  getPossibleAttackTargets,
} from "@/lib/hexUtils";
import { sampleCards } from "@/lib/cardUtils";
import { runMockAI } from "@/lib/mockAi";
import { GameState, Position } from "@/types/Game";
import { HexTile } from "@/types/Terrain";

// Define the context state
interface GameContextState {
  gameState: GameState;
  tiles: HexTile[];
  playerDeck: Card[];
  playerHand: CardInstance[];
  aiHand: CardInstance[];
  placedUnits: CardInstance[];
  aiUnits: CardInstance[];
  selectedCard: CardInstance | null;
  selectedTile: HexTile | null;
  possibleMoves: Position[];
  possibleAttacks: Position[];
  gridSize: number;
  highlightedTiles: Position[];
  placedFortresses: number;
  aiMessage: string;
}

// Add the missing action type for starting battle phase
type GameAction =
  | { type: "INITIALIZE_GAME" }
  | { type: "SELECT_CARD"; payload: CardInstance | null }
  | { type: "SELECT_TILE"; payload: HexTile | null }
  | { type: "PLACE_FORTRESS"; payload: Position }
  | { type: "PLACE_UNIT"; payload: Position }
  | { type: "MOVE_UNIT"; payload: Position }
  | { type: "ATTACK"; payload: Position }
  | { type: "END_PLAYER_TURN" }
  | { type: "END_AI_TURN" }
  | {
      type: "AI_ACTION";
      payload: { tiles: HexTile[]; aiUnits: CardInstance[]; message: string };
    }
  | { type: "SET_HIGHLIGHTED_TILES"; payload: Position[] }
  | { type: "START_BATTLE_PHASE" };

// Initial state
const initialState: GameContextState = {
  gameState: {
    turn: 0,
    maxTurns: 20,
    currentPlayer: "player",
    phase: "setup",
    winner: null,
  },
  tiles: [],
  playerDeck: [],
  playerHand: [],
  aiHand: [],
  placedUnits: [],
  aiUnits: [],
  selectedCard: null,
  selectedTile: null,
  possibleMoves: [],
  possibleAttacks: [],
  gridSize: 5, // Size of the hex grid (radius)
  highlightedTiles: [],
  placedFortresses: 0,
  aiMessage: "",
};

// Create the context
const GameContext = createContext<{
  state: GameContextState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Reducer function
const gameReducer = (
  state: GameContextState,
  action: GameAction
): GameContextState => {
  switch (action.type) {
    case "INITIALIZE_GAME": {
      // Generate the hex grid
      const gridSize = state.gridSize;
      const tiles = generateHexGrid(gridSize);

      // Get sample cards for player deck
      const playerDeck = sampleCards(8);

      // Create card instances for player and AI
      const playerHand = createCardInstances(playerDeck.slice(0, 5));
      const aiHand = createCardInstances(sampleCards(5));

      // Initialize game state
      const gameState = initializeGame(playerDeck, gridSize, tiles);

      return {
        ...state,
        gameState,
        tiles,
        playerDeck,
        playerHand,
        aiHand,
        placedUnits: [],
        aiUnits: [],
        selectedCard: null,
        selectedTile: null,
        possibleMoves: [],
        possibleAttacks: [],
        highlightedTiles: [],
        placedFortresses: 0,
        aiMessage: "",
      };
    }

    case "SELECT_CARD": {
      const selectedCard = action.payload;

      // Clear tile selection
      return {
        ...state,
        selectedCard,
        selectedTile: null,
        possibleMoves: [],
        possibleAttacks: [],
        highlightedTiles: [],
      };
    }

    case "SELECT_TILE": {
      const selectedTile = action.payload;

      if (!selectedTile) {
        return {
          ...state,
          selectedTile: null,
          possibleMoves: [],
          possibleAttacks: [],
          highlightedTiles: [],
        };
      }

      // If a unit is selected, calculate possible moves or attacks
      if (selectedTile.unit && selectedTile.unit.canAct) {
        const unit = selectedTile.unit;

        // Determine possible moves
        const possibleMoves = !unit.hasMoved
          ? getPossibleMoves(unit, state.tiles, state.gridSize)
          : [];

        // Determine possible attacks
        const possibleAttacks = !unit.hasAttacked
          ? getPossibleAttackTargets(unit, state.tiles, state.gridSize)
          : [];

        // Highlight the possible moves and attacks
        const highlightedTiles = [...possibleMoves, ...possibleAttacks];

        return {
          ...state,
          selectedCard: null,
          selectedTile,
          possibleMoves,
          possibleAttacks,
          highlightedTiles,
        };
      }

      // Regular tile selection
      return {
        ...state,
        selectedCard: null,
        selectedTile,
        possibleMoves: [],
        possibleAttacks: [],
        highlightedTiles: [],
      };
    }

    case "PLACE_FORTRESS": {
      // Can only place 2 fortresses during setup
      if (state.placedFortresses >= 2 || state.gameState.phase !== "setup") {
        return state;
      }

      const position = action.payload;

      // Ensure position is on player's side (negative q values)
      if (position.q >= 0) {
        return state;
      }

      // Check if position is already occupied
      const targetTile = state.tiles.find(
        (tile) =>
          tile.position.q === position.q && tile.position.r === position.r
      );

      if (!targetTile || targetTile.fortress || targetTile.unit) {
        return state;
      }

      // Place the fortress
      const updatedTiles = placeFortress(state.tiles, position, "player");

      // Check if we've placed all fortresses
      const newPlacedFortresses = state.placedFortresses + 1;

      return {
        ...state,
        tiles: updatedTiles,
        placedFortresses: newPlacedFortresses,
        selectedTile: null,
        highlightedTiles: [],
      };
    }

    case "PLACE_UNIT": {
      // Can only place units during battle phase and if a card is selected
      if (state.gameState.phase !== "battle" || !state.selectedCard) {
        return state;
      }

      const position = action.payload;

      // Check if position is valid (player's side)
      if (position.q >= 0) {
        return state;
      }

      // Check if position is already occupied
      const targetTile = state.tiles.find(
        (tile) =>
          tile.position.q === position.q && tile.position.r === position.r
      );

      if (!targetTile || targetTile.fortress || targetTile.unit) {
        return state;
      }

      // Place the unit
      const { tiles, unit } = placeUnit(
        state.tiles,
        state.selectedCard,
        position
      );

      // Remove the card from hand
      const updatedHand = state.playerHand.filter(
        (card) => card.instanceId !== state.selectedCard!.instanceId
      );

      // Add to placed units
      const updatedPlacedUnits = [...state.placedUnits, unit];

      return {
        ...state,
        tiles,
        playerHand: updatedHand,
        placedUnits: updatedPlacedUnits,
        selectedCard: null,
        selectedTile: null,
        highlightedTiles: [],
      };
    }

    case "MOVE_UNIT": {
      // Need a selected tile with a unit that can move
      if (
        !state.selectedTile ||
        !state.selectedTile.unit ||
        state.selectedTile.unit.hasMoved ||
        !state.possibleMoves.length
      ) {
        return state;
      }

      const targetPosition = action.payload;

      // Check if the target position is in the possible moves list
      const isValidMove = state.possibleMoves.some(
        (pos) => pos.q === targetPosition.q && pos.r === targetPosition.r
      );

      if (!isValidMove) {
        return state;
      }

      // Move the unit
      const { tiles, unit } = moveUnit(
        state.tiles,
        state.selectedTile.unit,
        targetPosition
      );

      // Find the new tile with the unit
      const newSelectedTile = tiles.find(
        (tile) =>
          tile.position.q === targetPosition.q &&
          tile.position.r === targetPosition.r
      );

      // Update placed units list
      const updatedPlacedUnits = state.placedUnits.map((placedUnit) =>
        placedUnit.instanceId === unit.instanceId ? unit : placedUnit
      );

      // Calculate new possible attacks
      const possibleAttacks = !unit.hasAttacked
        ? getPossibleAttackTargets(unit, tiles, state.gridSize)
        : [];

      return {
        ...state,
        tiles,
        placedUnits: updatedPlacedUnits,
        selectedTile: newSelectedTile || null,
        possibleMoves: [],
        possibleAttacks,
        highlightedTiles: possibleAttacks,
      };
    }

    case "ATTACK": {
      // Need a selected tile with a unit that can attack
      if (
        !state.selectedTile ||
        !state.selectedTile.unit ||
        state.selectedTile.unit.hasAttacked ||
        !state.possibleAttacks.length
      ) {
        return state;
      }

      const targetPosition = action.payload;

      // Check if the target position is in the possible attacks list
      const isValidAttack = state.possibleAttacks.some(
        (pos) => pos.q === targetPosition.q && pos.r === targetPosition.r
      );

      if (!isValidAttack) {
        return state;
      }

      // Perform the attack
      const { tiles, attacker } = performAttack(
        state.tiles,
        state.selectedTile.unit,
        targetPosition
      );

      // Find the updated tile with the attacking unit
      const newSelectedTile = tiles.find(
        (tile) => tile.unit && tile.unit.instanceId === attacker.instanceId
      );

      // Update placed units list
      const updatedPlacedUnits = state.placedUnits.map((placedUnit) =>
        placedUnit.instanceId === attacker.instanceId ? attacker : placedUnit
      );

      return {
        ...state,
        tiles,
        placedUnits: updatedPlacedUnits,
        selectedTile: newSelectedTile || null,
        possibleMoves: [],
        possibleAttacks: [],
        highlightedTiles: [],
      };
    }

    case "END_PLAYER_TURN": {
      const { gameState: updatedGameState, tiles: updatedTiles } =
        endPlayerTurn(state.gameState, state.tiles);

      return {
        ...state,
        gameState: updatedGameState,
        tiles: updatedTiles,
        selectedCard: null,
        selectedTile: null,
        possibleMoves: [],
        possibleAttacks: [],
        highlightedTiles: [],
      };
    }

    case "END_AI_TURN": {
      const { gameState: updatedGameState, tiles: updatedTiles } = endAITurn(
        state.gameState,
        state.tiles
      );

      return {
        ...state,
        gameState: updatedGameState,
        tiles: updatedTiles,
        selectedCard: null,
        selectedTile: null,
        possibleMoves: [],
        possibleAttacks: [],
        highlightedTiles: [],
      };
    }

    case "AI_ACTION": {
      return {
        ...state,
        tiles: action.payload.tiles,
        aiUnits: action.payload.aiUnits,
        aiMessage: action.payload.message,
      };
    }

    case "SET_HIGHLIGHTED_TILES": {
      return {
        ...state,
        highlightedTiles: action.payload,
      };
    }

    case "START_BATTLE_PHASE": {
      // Place AI fortresses on their side (positive q values)
      let updatedTiles = [...state.tiles];

      // Simple strategy: place fortresses at opposite corners
      const gridSize = state.gridSize;
      const aiFortressPositions = [
        { q: Math.floor(gridSize / 2), r: -Math.floor(gridSize / 2) },
        { q: gridSize - 1, r: -gridSize + 1 },
      ];

      // Place the AI fortresses
      aiFortressPositions.forEach((position) => {
        updatedTiles = placeFortress(updatedTiles, position, "ai");
      });

      return {
        ...state,
        tiles: updatedTiles,
        gameState: {
          ...state.gameState,
          phase: "battle",
        },
      };
    }

    default:
      return state;
  }
};

// Game Provider Component
export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Initialize game when component mounts
  useEffect(() => {
    dispatch({ type: "INITIALIZE_GAME" });
  }, []);

  // Handle AI turn logic when it's the AI's turn
  useEffect(() => {
    if (
      state.gameState.currentPlayer === "ai" &&
      state.gameState.phase === "battle"
    ) {
      // Delay to simulate AI thinking
      const aiTurnTimer = setTimeout(() => {
        // Run the mock AI
        const { tiles, aiUnits, message } = runMockAI(
          state.gameState,
          state.tiles,
          state.aiUnits,
          state.aiHand
        );

        // Update state with AI's action
        dispatch({
          type: "AI_ACTION",
          payload: {
            tiles,
            aiUnits,
            message,
          },
        });

        // End AI turn after a short delay
        setTimeout(() => {
          dispatch({ type: "END_AI_TURN" });
        }, 1500);
      }, 1500);

      return () => clearTimeout(aiTurnTimer);
    }
  }, [
    state.gameState.currentPlayer,
    state.gameState.phase,
    state.tiles,
    state.aiUnits,
    state.aiHand,
  ]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
