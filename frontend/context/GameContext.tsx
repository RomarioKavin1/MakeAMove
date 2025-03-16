"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { Card, CardInstance, CardType } from "@/types/Card";
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
  getPlacementPositions,
} from "@/lib/hexUtils";
import { sampleCards } from "@/lib/cardUtils";
import { runMockAI } from "@/lib/mockAI";
import { GameState, Position, UnitAnimation } from "@/types/Game";
import { HexTile } from "@/types/Terrain";

// Define animation types
export type AnimationState = "idle" | "attack" | "walk";
export type AnimationDirection = "left" | "right";

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
  unitAnimations: Record<string, UnitAnimation>;
}

// Define actions
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
  | { type: "START_BATTLE_PHASE" }
  | {
      type: "UNIT_ANIMATION_START";
      payload: {
        unitId: string;
        state: AnimationState;
        target?: Position;
      };
    }
  | { type: "UNIT_ANIMATION_END"; payload: { unitId: string } };

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
  gridSize: 5, // Size of the hex grid
  highlightedTiles: [],
  placedFortresses: 0,
  aiMessage: "",
  unitAnimations: {},
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

      // Create card instances for player and AI with owner property
      const playerHand = createCardInstances(playerDeck.slice(0, 5), "player");
      const aiHand = createCardInstances(sampleCards(5), "ai");

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
        unitAnimations: {},
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

      // If a unit is selected, check if it's a player's unit
      if (selectedTile.unit) {
        // Only allow selecting player's units, not AI units
        if (
          selectedTile.unit.owner !== "player" &&
          state.gameState.currentPlayer === "player"
        ) {
          console.log("Cannot select enemy units during player turn");
          return state;
        }

        // Only allow selecting AI units during AI turn
        if (
          selectedTile.unit.owner !== "ai" &&
          state.gameState.currentPlayer === "ai"
        ) {
          console.log("Cannot select player units during AI turn");
          return state;
        }

        if (selectedTile.unit.canAct) {
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
        console.log("Fortresses must be placed on player's side");
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
    // Update this in GameContext.tsx to remove the restriction on placing units only on player's side
    case "PLACE_UNIT": {
      // Can only place units during battle phase and if a card is selected
      if (state.gameState.phase !== "battle" || !state.selectedCard) {
        return state;
      }

      const position = action.payload;

      // Only allow placement on valid tiles (near fortresses)
      const validPlacements = getPlacementPositions(state.tiles);
      const isValidPlacement = validPlacements.some(
        (pos) => pos.q === position.q && pos.r === position.r
      );

      if (!isValidPlacement) {
        console.log("Units must be placed adjacent to player fortresses");
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

      // Make sure the card has owner property
      const cardWithOwner = {
        ...state.selectedCard,
        owner: "player" as const,
      };

      // Place the unit
      const { tiles, unit } = placeUnit(state.tiles, cardWithOwner, position);

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
        console.log("Invalid move - not in possible moves list");
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
      const targetPosition = action.payload;

      if (!state.selectedTile || !state.selectedTile.unit) {
        return state;
      }

      // Get the current unit
      const unit = state.selectedTile.unit;

      // Make sure the unit hasn't already attacked
      if (unit.hasAttacked) {
        console.log("Unit has already attacked this turn");
        return state;
      }

      // Get the target tile
      const targetTile = state.tiles.find(
        (tile) =>
          tile.position.q === targetPosition.q &&
          tile.position.r === targetPosition.r
      );

      if (!targetTile) {
        console.log("Invalid target position");
        return state;
      }

      // Prevent attacking friendly units or fortresses
      if (
        (targetTile.unit && targetTile.unit.owner === unit.owner) ||
        (targetTile.fortress && targetTile.fortress.owner === unit.owner)
      ) {
        console.log("Cannot attack friendly units or fortresses");
        return state;
      }

      // Perform the attack with the game logic function
      const {
        tiles: updatedTiles,
        attacker: updatedUnit,
        damageDealt,
      } = performAttack(state.tiles, unit, targetPosition);

      // Set an AI message about the attack for feedback
      let aiMessage = "";
      if (damageDealt > 0) {
        if (targetTile.unit) {
          aiMessage = `${unit.name} attacks for ${damageDealt} damage!`;
        } else if (targetTile.fortress) {
          aiMessage = `${unit.name} attacks the fortress for ${damageDealt} damage!`;
        }
      }

      // Update the placedUnits list
      const updatedPlacedUnits = state.placedUnits.map((placedUnit) =>
        placedUnit.instanceId === updatedUnit.instanceId
          ? updatedUnit
          : placedUnit
      );

      // Clear possible attacks since the unit attacked
      return {
        ...state,
        tiles: updatedTiles,
        placedUnits: updatedPlacedUnits,
        selectedTile: null,
        possibleMoves: [],
        possibleAttacks: [],
        highlightedTiles: [],
        aiMessage,
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

    case "UNIT_ANIMATION_START": {
      const { unitId, state: animationState, target } = action.payload;

      // Find the unit's current position to determine direction
      const unitTile = state.tiles.find(
        (tile) => tile.unit?.instanceId === unitId
      );
      const unitPosition = unitTile?.position;

      // Determine direction based on target position
      let direction: AnimationDirection = "right";
      if (unitPosition && target) {
        direction = target.q > unitPosition.q ? "right" : "left";
      }

      return {
        ...state,
        unitAnimations: {
          ...state.unitAnimations,
          [unitId]: {
            state: animationState,
            target,
            direction,
          },
        },
      };
    }

    case "UNIT_ANIMATION_END": {
      const { unitId } = action.payload;

      // Create a new animations object without the finished animation
      const updatedAnimations = { ...state.unitAnimations };
      delete updatedAnimations[unitId];

      return {
        ...state,
        unitAnimations: updatedAnimations,
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
