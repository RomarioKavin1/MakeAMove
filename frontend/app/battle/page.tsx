// src/app/battle/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import HexGrid from "@/components/game/HexGrid";
import Card from "@/components/game/Card";
import BattleControls from "@/components/game/BattleControls";
import { CardInstance } from "@/types/Card";
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
  } = state;

  const [message, setMessage] = useState<string>("");
  const [aiActionMessage, setAiActionMessage] = useState<string>("");

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

  // Update message based on game state
  useEffect(() => {
    if (gameState.phase === "setup") {
      if (placedFortresses < 2) {
        setMessage(`Place your fortresses (${placedFortresses}/2)`);
      } else {
        // Auto proceed to battle phase once fortresses are placed
        setMessage("Fortresses placed. Starting battle...");

        // In a real implementation, the AI would place its fortresses here
        // For the MVP, we'll just transition to battle phase
        setTimeout(() => {
          // Transition to battle phase
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
      dispatch({ type: "PLACE_UNIT", payload: tile.position });
      return;
    }

    // Check if clicked on a possible movement destination
    const isMoveDestination = possibleMoves.some(
      (pos) => pos.q === tile.position.q && pos.r === tile.position.r
    );

    if (isMoveDestination) {
      dispatch({ type: "MOVE_UNIT", payload: tile.position });
      return;
    }

    // Check if clicked on a possible attack target
    const isAttackTarget = possibleAttacks.some(
      (pos) => pos.q === tile.position.q && pos.r === tile.position.r
    );

    if (isAttackTarget) {
      dispatch({ type: "ATTACK", payload: tile.position });
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
            selectedTile={selectedTile!}
            highlightedTiles={highlightedTiles}
            size={40} // Size of hexagons
          />

          {/* Battle controls (only visible during battle phase) */}
          {gameState.phase === "battle" && (
            <div className="absolute bottom-4 right-4">
              <BattleControls
                onEndTurn={handleEndTurn}
                isPlayerTurn={gameState.currentPlayer === "player"}
              />
            </div>
          )}
        </div>

        {/* Right sidebar (card hand) */}
        <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-white text-lg font-bold mb-4">Your Cards</h2>
          <div className="flex flex-col space-y-4">
            {playerHand.map((card) => (
              <div key={card.instanceId}>
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
    </div>
  );
};

export default BattlePage;
