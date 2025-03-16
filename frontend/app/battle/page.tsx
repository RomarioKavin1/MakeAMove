"use client";
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import HexGrid from "@/components/game/HexGrid";
import Card from "@/components/game/Card";
import BattleControls from "@/components/game/BattleControls";
import { CardInstance } from "@/types/Card";
import { getPlacementPositions } from "@/lib/hexUtils";
import styles from "./Battle.module.css";
import { Position } from "@/types/Game";
import { HexTile } from "@/types/Terrain";

const BattlePage: React.FC = () => {
  const { state, dispatch } = useGame();
  const {
    gameState,
    tiles,
    playerHand,
    selectedCard,
    selectedTile,
    possibleMoves,
    possibleAttacks,
    highlightedTiles,
    placedFortresses,
    aiMessage,
    unitAnimations,
  } = state;

  const [message, setMessage] = useState<string>("");
  const [aiActionMessage, setAiActionMessage] = useState<string>("");
  const [placementTiles, setPlacementTiles] = useState<Position[]>([]);
  const [tileDetailsOpen, setTileDetailsOpen] = useState<boolean>(false);
  const [attackTarget, setAttackTarget] = useState<Position | null>(null);

  // Update when selectedTile or possibleAttacks changes
  useEffect(() => {
    // If there are possible attacks and a selected tile with a unit, set first attack target
    console.log({
      canAttack:
        possibleAttacks.length > 0 &&
        !!selectedTile?.unit &&
        !selectedTile.unit.hasAttacked,
      hasAttacks: possibleAttacks.length > 0,
      hasSelectedUnit: !!selectedTile?.unit,
      notAttacked: selectedTile?.unit ? !selectedTile.unit.hasAttacked : false,
      attackTarget,
    });
    if (possibleAttacks.length > 0 && selectedTile?.unit) {
      setAttackTarget(possibleAttacks[0]);
      console.log("Possible attacks:", possibleAttacks);
    } else {
      setAttackTarget(null);
      console.log("Possible attacks:", possibleAttacks);
    }
  }, [selectedTile, possibleAttacks]);
  const handleAttack = () => {
    if (!attackTarget || !selectedTile?.unit) return;

    // Start attack animation
    dispatch({
      type: "UNIT_ANIMATION_START",
      payload: {
        unitId: selectedTile.unit.instanceId,
        state: "attack",
        target: attackTarget,
      },
    });

    // Delay the actual attack to allow animation to play
    setTimeout(() => {
      dispatch({ type: "ATTACK", payload: attackTarget });

      // End animation
      setTimeout(() => {
        dispatch({
          type: "UNIT_ANIMATION_END",
          payload: { unitId: selectedTile.unit!.instanceId },
        });
      }, 700); // Animation completion time
    }, 600); // Animation start delay
  };

  // Update placement tiles when a card is selected
  useEffect(() => {
    if (selectedCard) {
      setPlacementTiles(getPlacementPositions(tiles));
    } else {
      setPlacementTiles([]);
    }
  }, [selectedCard, tiles]);

  // Show AI action message when it changes
  useEffect(() => {
    if (aiMessage) {
      setAiActionMessage(aiMessage);

      // Clear after a few seconds
      const timer = setTimeout(() => {
        setAiActionMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [aiMessage]);

  // Open tile details panel when a tile is selected
  useEffect(() => {
    if (selectedTile) {
      setTileDetailsOpen(true);
    }
  }, [selectedTile]);

  // Update message based on game state
  useEffect(() => {
    if (gameState.phase === "setup") {
      if (placedFortresses < 2) {
        setMessage(`Place your fortresses (${placedFortresses}/2)`);
      } else {
        // Auto proceed to battle phase once fortresses are placed
        setMessage("Fortresses placed. Starting battle...");

        setTimeout(() => {
          dispatch({ type: "START_BATTLE_PHASE" });
        }, 2000);
      }
    } else if (gameState.phase === "battle") {
      if (gameState.currentPlayer === "player") {
        if (selectedCard) {
          setMessage("Select a tile to place your unit");
        } else if (selectedTile && selectedTile.unit) {
          if (possibleMoves.length > 0 && !selectedTile.unit.hasMoved) {
            setMessage("Select a tile to move to");
          } else if (
            possibleAttacks.length > 0 &&
            !selectedTile.unit.hasAttacked
          ) {
            setMessage("Select a target to attack");
          } else {
            setMessage("Unit has completed its actions");
          }
        } else {
          setMessage("Select a card to play or a unit to command");
        }
      } else {
        setMessage("AI is thinking...");
      }
    } else if (gameState.phase === "gameOver") {
      setMessage(
        `Game Over! ${
          gameState.winner
            ? `${gameState.winner.toUpperCase()} wins!`
            : "It's a draw!"
        }`
      );
    }
  }, [
    gameState,
    selectedCard,
    selectedTile,
    possibleMoves,
    possibleAttacks,
    placedFortresses,
    dispatch,
  ]);

  // Handle tile click
  // Update the handleTileClick function for improved animations
  const handleTileClick = (tile: HexTile) => {
    if (gameState.phase === "setup") {
      // In setup phase, clicking a tile places a fortress
      dispatch({ type: "PLACE_FORTRESS", payload: tile.position });
      return;
    }

    if (gameState.phase !== "battle" || gameState.currentPlayer !== "player") {
      return;
    }

    // If a card is selected, try to place it
    if (selectedCard) {
      // Check if this is a valid placement tile
      const isValidPlacement = placementTiles.some(
        (pos) => pos.q === tile.position.q && pos.r === tile.position.r
      );

      if (isValidPlacement) {
        dispatch({ type: "PLACE_UNIT", payload: tile.position });
      }
      return;
    }

    // If we're selecting a player's unit
    if (tile.unit && tile.unit.owner === "player") {
      // Select the unit - this will calculate possible moves/attacks
      dispatch({ type: "SELECT_TILE", payload: tile });

      // The possibleAttacks array will be updated in the reducer
      return;
    }

    // If we already have a selected unit, check if this is an attack target
    if (selectedTile?.unit && !selectedTile.unit.hasAttacked) {
      // Check if this tile is in the possible attacks list
      const isAttackTarget = possibleAttacks.some(
        (pos) => pos.q === tile.position.q && pos.r === tile.position.r
      );

      if (isAttackTarget) {
        console.log(
          `Attacking target at (${tile.position.q}, ${tile.position.r})`
        );

        // Start attack animation
        dispatch({
          type: "UNIT_ANIMATION_START",
          payload: {
            unitId: selectedTile.unit.instanceId,
            state: "attack",
            target: tile.position,
          },
        });

        // Perform attack after animation starts
        setTimeout(() => {
          dispatch({ type: "ATTACK", payload: tile.position });

          // End animation
          setTimeout(() => {
            dispatch({
              type: "UNIT_ANIMATION_END",
              payload: { unitId: selectedTile.unit!.instanceId },
            });
          }, 700);
        }, 600);

        return;
      }
    }

    // If a move destination, handle walking animation and movement
    const isMoveDestination = possibleMoves.some(
      (pos) => pos.q === tile.position.q && pos.r === tile.position.r
    );

    if (isMoveDestination && selectedTile?.unit) {
      // Start walk animation before actual move
      dispatch({
        type: "UNIT_ANIMATION_START",
        payload: {
          unitId: selectedTile.unit.instanceId,
          state: "walk",
          target: tile.position,
        },
      });

      // For walking animation to be visible, use a long delay
      setTimeout(() => {
        dispatch({ type: "MOVE_UNIT", payload: tile.position });

        // End animation after the move
        setTimeout(() => {
          dispatch({
            type: "UNIT_ANIMATION_END",
            payload: { unitId: selectedTile.unit!.instanceId },
          });
        }, 500);
      }, 900);

      return;
    }

    // Otherwise, just select the tile
    dispatch({ type: "SELECT_TILE", payload: tile });
  };

  // Handle card selection
  const handleCardSelect = (card: CardInstance) => {
    if (gameState.phase !== "battle" || gameState.currentPlayer !== "player") {
      return;
    }

    dispatch({ type: "SELECT_CARD", payload: card });
  };

  // Handle end turn
  const handleEndTurn = () => {
    if (gameState.phase !== "battle" || gameState.currentPlayer !== "player") {
      return;
    }

    dispatch({ type: "END_PLAYER_TURN" });
  };

  // Close tile details panel
  const closeTileDetails = () => {
    setTileDetailsOpen(false);
  };

  // Get terrain description
  const getTerrainDescription = (type: string) => {
    const terrainInfo = {
      plains: "Open grassland with no movement penalties.",
      forest: "Dense trees that provide cover and reduce damage taken.",
      mountain: "Rugged terrain that increases defense but slows movement.",
      water: "Bodies of water that slow movement significantly.",
      desert: "Arid land that reduces unit stamina and healing.",
      swamp: "Marshy areas that slow movement and may cause status effects.",
      healing:
        "Magic springs that restore health to units that end their turn here.",
    };
    return terrainInfo[type as keyof typeof terrainInfo] || "Unknown terrain";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Game header with turn info */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MakeAMove</h1>
        <div className="flex space-x-4 items-center">
          <div className="px-3 py-1 bg-indigo-700 rounded-md">
            Turn: {gameState.turn}/{gameState.maxTurns}
          </div>
          <div
            className={`px-3 py-1 rounded-md ${
              gameState.currentPlayer === "player"
                ? "bg-blue-600"
                : "bg-red-600"
            }`}
          >
            {gameState.currentPlayer === "player" ? "Your Turn" : "AI Turn"}
          </div>
        </div>
      </div>

      {/* Game message */}
      <div className="bg-gray-800 bg-opacity-80 text-white p-2 text-center">
        {message}
      </div>

      {/* AI action message (only visible when AI makes a move) */}
      {aiActionMessage && (
        <div className="bg-red-900 bg-opacity-80 text-white p-2 text-center animate-pulse">
          {aiActionMessage}
        </div>
      )}

      {/* Main game area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Hex grid (battlefield) */}
        <div className="flex-1 relative">
          <HexGrid
            tiles={tiles}
            onTileClick={handleTileClick}
            selectedTile={selectedTile}
            highlightedTiles={[...highlightedTiles, ...placementTiles]}
            selectedCard={selectedCard}
            size={40} // Size of hexagons
            showDividingLine={true}
            unitAnimations={unitAnimations} // Pass the unitAnimations from state
          />

          {/* Battle controls (only visible during battle phase) */}
          {gameState.phase === "battle" && (
            <div className="absolute bottom-4 right-4">
              <BattleControls
                onEndTurn={handleEndTurn}
                onAttack={handleAttack}
                isPlayerTurn={gameState.currentPlayer === "player"}
                canAttack={
                  possibleAttacks.length > 0 &&
                  !!selectedTile?.unit &&
                  !selectedTile.unit.hasAttacked
                }
                attackTarget={attackTarget || undefined}
              />
            </div>
          )}
        </div>

        {/* Right sidebar (card hand) */}
        <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-white text-lg font-bold mb-4">Your Cards</h2>
          <div className="flex flex-col space-y-4">
            {playerHand.map((card) => (
              <div
                key={card.instanceId}
                className={`transition-all duration-200 ${
                  selectedCard?.instanceId === card.instanceId
                    ? "transform scale-105 ring-2 ring-blue-400 rounded-lg"
                    : ""
                }`}
              >
                <Card
                  card={card}
                  onClick={() => handleCardSelect(card)}
                  isSelected={selectedCard?.instanceId === card.instanceId}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tile Details Panel - Shown when a tile is selected */}
      {tileDetailsOpen && selectedTile && (
        <div className="absolute bottom-0 left-0 p-4 bg-gray-800 bg-opacity-90 rounded-tr-lg text-white m-4 max-w-md animate-slideUp">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">Tile Information</h3>
            <button
              onClick={closeTileDetails}
              className="text-white hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 mb-2">
              <span className="text-gray-400">Position:</span>{" "}
              {selectedTile.position.q}, {selectedTile.position.r}
            </div>

            <div className="col-span-2 p-2 bg-gray-700 rounded-md mb-3">
              <div className="flex items-center mb-1">
                <div
                  className="w-4 h-4 mr-2 rounded-sm"
                  style={{
                    backgroundColor: `rgba(${
                      selectedTile.terrain.type === "plains"
                        ? "120,200,80"
                        : selectedTile.terrain.type === "forest"
                        ? "34,139,34"
                        : selectedTile.terrain.type === "mountain"
                        ? "139,137,137"
                        : selectedTile.terrain.type === "water"
                        ? "30,144,255"
                        : selectedTile.terrain.type === "desert"
                        ? "210,180,140"
                        : selectedTile.terrain.type === "swamp"
                        ? "107,142,35"
                        : "220,20,60"
                    },.8)`,
                  }}
                ></div>
                <span className="font-semibold capitalize">
                  {selectedTile.terrain.type} Terrain
                </span>
              </div>
              <p className="text-sm text-gray-300">
                {getTerrainDescription(selectedTile.terrain.type)}
              </p>
              {/* <div className="mt-1 text-xs">
                <span className="text-gray-400">Move Cost:</span>{" "}
                {selectedTile.terrain.moveCost}
              </div> */}
            </div>

            {selectedTile.fortress && (
              <div className="col-span-2 p-2 bg-gray-700 rounded-md mb-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    Fortress ({selectedTile.fortress.owner.toUpperCase()})
                  </span>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 mr-1 text-red-500"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold">
                      {selectedTile.fortress.health} /{" "}
                      {selectedTile.fortress.maxHealth}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full mt-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${
                        (selectedTile.fortress.health /
                          selectedTile.fortress.maxHealth) *
                        100
                      }%`,
                      backgroundColor:
                        selectedTile.fortress.owner === "player"
                          ? "rgba(0,100,255,0.8)"
                          : "rgba(255,50,50,0.8)",
                    }}
                  ></div>
                </div>
              </div>
            )}

            {selectedTile.unit && (
              <div className="col-span-2 p-2 bg-gray-700 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {selectedTile.unit.name} (
                    {/* {selectedTile.unit.owner.toUpperCase()}) */}
                  </span>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 mr-1 text-red-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-bold">
                      {selectedTile.unit.health} / {selectedTile.unit.maxHealth}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full mt-2 mb-3">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${
                        (selectedTile.unit.health /
                          selectedTile.unit.maxHealth) *
                        100
                      }%`,
                      backgroundColor:
                        selectedTile.unit.health >
                        selectedTile.unit.maxHealth * 0.6
                          ? "rgba(0,255,0,0.8)"
                          : selectedTile.unit.health >
                            selectedTile.unit.maxHealth * 0.3
                          ? "rgba(255,255,0,0.8)"
                          : "rgba(255,0,0,0.8)",
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-gray-300">Attack</span>
                      <span className="font-bold">
                        {selectedTile.unit.attack}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-gray-300">Range</span>
                      <span className="font-bold">
                        {selectedTile.unit.range}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-gray-300">Speed</span>
                      <span className="font-bold">
                        {/* {selectedTile.unit.movePoints} */}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-gray-300">Cost</span>
                      <span className="font-bold">
                        {/* {selectedTile.unit.cost} */}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs grid grid-cols-2 gap-1">
                  <div className="col-span-1">
                    <span
                      className={`px-2 py-1 rounded ${
                        selectedTile.unit.hasMoved
                          ? "bg-gray-600 text-gray-400"
                          : "bg-green-800 text-white"
                      }`}
                    >
                      {selectedTile.unit.hasMoved ? "Moved" : "Can Move"}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`px-2 py-1 rounded ${
                        selectedTile.unit.hasAttacked
                          ? "bg-gray-600 text-gray-400"
                          : "bg-red-800 text-white"
                      }`}
                    >
                      {selectedTile.unit.hasAttacked
                        ? "Attacked"
                        : "Can Attack"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {gameState.phase === "gameOver" && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-white text-3xl font-bold mb-4">
              {gameState.winner === "player"
                ? "Victory!"
                : gameState.winner === "ai"
                ? "Defeat!"
                : "Draw!"}
            </h2>
            <p className="text-white mb-6">
              {gameState.winner === "player"
                ? "You have defeated the AI!"
                : gameState.winner === "ai"
                ? "The AI has defeated you."
                : "The battle ended in a draw."}
            </p>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
              onClick={() => dispatch({ type: "INITIALIZE_GAME" })}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Add animation styles for slide up effect */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BattlePage;
