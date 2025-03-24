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
import ConnectButton from "@/components/petra/ConnectButton";

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
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Toggle the card drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Update when selectedTile or possibleAttacks changes
  useEffect(() => {
    if (possibleAttacks.length > 0 && selectedTile?.unit) {
      setAttackTarget(possibleAttacks[0]);
    } else {
      setAttackTarget(null);
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
        setMessage(`PLACE YOUR FORTRESSES (${placedFortresses}/2)`);
      } else {
        // Auto proceed to battle phase once fortresses are placed
        setMessage("FORTRESSES PLACED. STARTING BATTLE...");

        setTimeout(() => {
          dispatch({ type: "START_BATTLE_PHASE" });
        }, 2000);
      }
    } else if (gameState.phase === "battle") {
      if (gameState.currentPlayer === "player") {
        if (selectedCard) {
          setMessage("SELECT A TILE TO PLACE YOUR UNIT");
        } else if (selectedTile && selectedTile.unit) {
          if (possibleMoves.length > 0 && !selectedTile.unit.hasMoved) {
            setMessage("SELECT A TILE TO MOVE TO");
          } else if (
            possibleAttacks.length > 0 &&
            !selectedTile.unit.hasAttacked
          ) {
            setMessage("SELECT A TARGET TO ATTACK");
          } else {
            setMessage("UNIT HAS COMPLETED ACTIONS");
          }
        } else {
          setMessage("SELECT A CARD OR A UNIT TO COMMAND");
        }
      } else {
        setMessage("AI IS THINKING...");
      }
    } else if (gameState.phase === "gameOver") {
      setMessage(
        `GAME OVER! ${
          gameState.winner
            ? `${gameState.winner.toUpperCase()} WINS!`
            : "IT'S A DRAW!"
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
      // Check if this is a valid placement tile
      const isValidPlacement = placementTiles.some(
        (pos) => pos.q === tile.position.q && pos.r === tile.position.r
      );

      if (isValidPlacement) {
        dispatch({ type: "PLACE_UNIT", payload: tile.position });
        setDrawerOpen(false); // Close drawer after placing unit
      }
      return;
    }

    // If we're selecting a player's unit
    if (tile.unit && tile.unit.owner === "player") {
      // Select the unit - this will calculate possible moves/attacks
      dispatch({ type: "SELECT_TILE", payload: tile });
      return;
    }

    // If we already have a selected unit, check if this is an attack target
    if (selectedTile?.unit && !selectedTile.unit.hasAttacked) {
      // Check if this tile is in the possible attacks list
      const isAttackTarget = possibleAttacks.some(
        (pos) => pos.q === tile.position.q && pos.r === tile.position.r
      );

      if (isAttackTarget) {
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
    <div className={styles.battleContainer}>
      {/* Pixelated background */}
      <div className={`fixed inset-0 z-0 ${styles.pixelGridBg}`}></div>

      {/* Game header with turn info */}
      <header className={styles.battleHeader}>
        <div className={styles.headerContent}>
          <ConnectButton />
          <h1 className={styles.logoText}>MakeAMove</h1>
          <div className={styles.turnIndicator}>
            <div className={styles.turnCounter}>
              TURN: {gameState.turn}/{gameState.maxTurns}
            </div>
            <div
              className={
                gameState.currentPlayer === "player"
                  ? styles.playerTurn
                  : styles.aiTurn
              }
            >
              {gameState.currentPlayer === "player" ? "PLAYER TURN" : "AI TURN"}
            </div>
          </div>
        </div>
      </header>

      {/* Game message */}
      <div className={styles.messageBox}>{message}</div>

      {/* AI action message (only visible when AI makes a move) */}
      {aiActionMessage && (
        <div className={styles.aiMessage}>{aiActionMessage}</div>
      )}

      {/* Main game area */}
      <div className={styles.gameArea}>
        {/* Hex grid (battlefield) */}
        <div className={styles.hexGridContainer}>
          <HexGrid
            tiles={tiles}
            onTileClick={handleTileClick}
            selectedTile={selectedTile}
            highlightedTiles={[...highlightedTiles, ...placementTiles]}
            selectedCard={selectedCard}
            size={100} // Size of hexagons
            showDividingLine={true}
            unitAnimations={unitAnimations} // Pass the unitAnimations from state
          />

          {/* Battle controls */}
          {gameState.phase === "battle" && (
            <div className={styles.battleControls}>
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
      </div>

      {/* Card drawer toggle button */}
      <button
        className={`${styles.drawerToggle} ${
          drawerOpen ? styles.drawerOpen : ""
        }`}
        onClick={toggleDrawer}
      >
        {drawerOpen ? "▼ CLOSE CARDS ▼" : "▲ YOUR CARDS ▲"}
      </button>

      {/* Card drawer (slides up from bottom) */}
      <div
        className={`${styles.cardDrawer} ${
          drawerOpen ? styles.drawerOpen : ""
        }`}
      >
        <div className={styles.cardList}>
          {playerHand.map((card) => (
            <div
              key={card.instanceId}
              className={`${styles.cardWrapper} ${
                selectedCard?.instanceId === card.instanceId
                  ? styles.cardWrapperSelected
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

      {/* Tile Details Panel - Shown when a tile is selected */}
      {tileDetailsOpen && selectedTile && (
        <div className={styles.tileDetails}>
          <div className={styles.tileDetailsHeader}>
            <h3 className={styles.tileDetailsTitle}>TILE INFO</h3>
            <button onClick={closeTileDetails} className={styles.closeButton}>
              [X]
            </button>
          </div>

          <div className={styles.tileDetailsGrid}>
            <div className={styles.tilePosition}>
              <span className="text-gray-400">POSITION:</span>{" "}
              {selectedTile.position.q}, {selectedTile.position.r}
            </div>

            <div className={styles.terrainBox}>
              <div className={styles.terrainHeader}>
                <div
                  className={styles.terrainColor}
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
                <span className={styles.terrainName}>
                  {selectedTile.terrain.type} TERRAIN
                </span>
              </div>
              <p className={styles.terrainDescription}>
                {getTerrainDescription(selectedTile.terrain.type)}
              </p>
            </div>

            {selectedTile.fortress && (
              <div className={styles.fortressBox}>
                <div className={styles.entityHeader}>
                  <span className={styles.entityName}>
                    FORTRESS ({selectedTile.fortress.owner.toUpperCase()})
                  </span>
                  <div className={styles.healthDisplay}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={styles.healthIcon}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className={styles.healthText}>
                      {selectedTile.fortress.health} /{" "}
                      {selectedTile.fortress.maxHealth}
                    </span>
                  </div>
                </div>
                <div className={styles.healthBar}>
                  <div
                    className={styles.healthBarFill}
                    style={{
                      width: `${
                        (selectedTile.fortress.health /
                          selectedTile.fortress.maxHealth) *
                        100
                      }%`,
                      backgroundColor:
                        selectedTile.fortress.owner === "player"
                          ? "#4F46E5"
                          : "#EF4444",
                    }}
                  ></div>
                </div>
              </div>
            )}

            {selectedTile.unit && (
              <div className={styles.unitBox}>
                <div className={styles.entityHeader}>
                  <span className={styles.entityName}>
                    {selectedTile.unit.name} (
                    {selectedTile.unit.owner.toUpperCase()})
                  </span>
                  <div className={styles.healthDisplay}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={styles.healthIcon}
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={styles.healthText}>
                      {selectedTile.unit.health} / {selectedTile.unit.maxHealth}
                    </span>
                  </div>
                </div>
                <div className={styles.healthBar}>
                  <div
                    className={styles.healthBarFill}
                    style={{
                      width: `${
                        (selectedTile.unit.health /
                          selectedTile.unit.maxHealth) *
                        100
                      }%`,
                      backgroundColor:
                        selectedTile.unit.health >
                        selectedTile.unit.maxHealth * 0.6
                          ? "#10B981"
                          : selectedTile.unit.health >
                            selectedTile.unit.maxHealth * 0.3
                          ? "#FBBF24"
                          : "#EF4444",
                    }}
                  ></div>
                </div>

                <div className={styles.statGrid}>
                  <div className={styles.statItem}>
                    <div
                      className={styles.statIcon}
                      style={{
                        backgroundColor: "#EF4444",
                        borderColor: "#F87171",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <span className={styles.statLabel}>ATTACK</span>
                      <span className={styles.statValue}>
                        {selectedTile.unit.attack}
                      </span>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div
                      className={styles.statIcon}
                      style={{
                        backgroundColor: "#3B82F6",
                        borderColor: "#60A5FA",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                      <span className={styles.statLabel}>RANGE</span>
                      <span className={styles.statValue}>
                        {selectedTile.unit.range}
                      </span>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div
                      className={styles.statIcon}
                      style={{
                        backgroundColor: "#10B981",
                        borderColor: "#34D399",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                      <span className={styles.statLabel}>MOVE</span>
                      <span className={styles.statValue}>
                        {selectedTile.unit.movementRange}
                      </span>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div
                      className={styles.statIcon}
                      style={{
                        backgroundColor: "#8B5CF6",
                        borderColor: "#A78BFA",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                      <span className={styles.statLabel}>TYPE</span>
                      <span className={styles.statValue}>
                        {selectedTile.unit.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.unitStatus}>
                  <div>
                    <span
                      className={`${styles.statusIndicator} ${
                        selectedTile.unit.hasMoved
                          ? styles.moved
                          : styles.canMove
                      }`}
                    >
                      {selectedTile.unit.hasMoved ? "MOVED" : "CAN MOVE"}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`${styles.statusIndicator} ${
                        selectedTile.unit.hasAttacked
                          ? styles.attacked
                          : styles.canAttack
                      }`}
                    >
                      {selectedTile.unit.hasAttacked
                        ? "ATTACKED"
                        : "CAN ATTACK"}
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
        <div className={styles.gameOverOverlay}>
          <div className={styles.gameOverBox}>
            <h2 className={styles.gameOverTitle}>
              {gameState.winner === "player"
                ? "VICTORY!"
                : gameState.winner === "ai"
                ? "DEFEAT!"
                : "DRAW!"}
            </h2>
            <p className={styles.gameOverMessage}>
              {gameState.winner === "player"
                ? "YOU HAVE DEFEATED THE AI!"
                : gameState.winner === "ai"
                ? "THE AI HAS DEFEATED YOU."
                : "THE BATTLE ENDED IN A DRAW."}
            </p>
            <div className={styles.buttonContainer}>
              <button
                className={styles.playAgainButton}
                onClick={() => dispatch({ type: "INITIALIZE_GAME" })}
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattlePage;
