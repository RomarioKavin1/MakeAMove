// src/components/game/HexGrid.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { calculateHexPosition, getPlacementPositions } from "@/lib/hexUtils";
import styles from "./HexGrid.module.css";
import { Position, UnitAnimation } from "@/types/Game";
import { HexTile } from "@/types/Terrain";
import { CardInstance, CardType } from "@/types/Card";

interface HexGridProps {
  tiles: HexTile[];
  onTileClick: (tile: HexTile) => void;
  selectedTile?: HexTile | null;
  highlightedTiles?: Position[];
  possibleAttacks?: Position[]; // Add this prop
  selectedCard?: CardInstance | null;
  size: number;
  showDividingLine?: boolean;
  unitAnimations?: Record<string, UnitAnimation>;
}

// Update the component definition to include possibleAttacks
const HexGrid: React.FC<HexGridProps> = ({
  tiles,
  onTileClick,
  selectedTile,
  highlightedTiles = [],
  possibleAttacks = [], // Add default value
  selectedCard,
  size,
  showDividingLine = false,
  unitAnimations = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState("-500 -400 1000 800");
  const [transform, setTransform] = useState("scale(1) translate(0, 0)");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [placementPositions, setPlacementPositions] = useState<Position[]>([]);
  const [gridBoundaries, setGridBoundaries] = useState({
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    width: 0,
    height: 0,
  });

  // Animation states for units
  const [unitStates, setUnitStates] = useState<
    Record<string, "idle" | "attack" | "walk">
  >({});

  // Calculate placement positions when placing a unit
  useEffect(() => {
    if (selectedCard) {
      setPlacementPositions(getPlacementPositions(tiles));
    } else {
      setPlacementPositions([]);
    }
  }, [selectedCard, tiles]);

  // Calculate boundaries of the grid
  useEffect(() => {
    if (!tiles.length) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Find min and max coordinates
    tiles.forEach((tile) => {
      const { x, y } = calculateHexPosition(tile.position, size);
      minX = Math.min(minX, x - size);
      minY = Math.min(minY, y - size);
      maxX = Math.max(maxX, x + size);
      maxY = Math.max(maxY, y + size);
    });

    // Add padding
    const padding = size * 2;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    setGridBoundaries({ minX, minY, maxX, maxY, width, height });
    setViewBox(`${minX} ${minY} ${width} ${height}`);
  }, [tiles, size]);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      // Calculate new zoom level
      const zoomStep = 0.1;
      const newZoom =
        e.deltaY > 0
          ? Math.max(0.5, zoom - zoomStep) // Zoom out (minimum 0.5)
          : Math.min(2.0, zoom + zoomStep); // Zoom in (maximum 2.0)

      setZoom(newZoom);

      // Update transform
      setTransform(`scale(${newZoom}) translate(${pan.x}px, ${pan.y}px)`);
    },
    [zoom, pan]
  );

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle mouse move for panning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;

      setPan({ x: pan.x + dx, y: pan.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });

      // Update transform
      setTransform(
        `scale(${zoom}) translate(${pan.x + dx}px, ${pan.y + dy}px)`
      );
    },
    [isDragging, dragStart, zoom, pan]
  );

  // Handle mouse up to end panning
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Generate the points for a flat-topped hexagon
  const getHexPoints = (size: number): string => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = size * Math.cos(angleRad);
      const y = size * Math.sin(angleRad);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  // Simulate unit action (for animations)
  const simulateUnitAction = useCallback(
    (unitId: string, action: "idle" | "attack" | "walk") => {
      setUnitStates((prev) => ({ ...prev, [unitId]: action }));

      // Return to idle after animation completes
      if (action !== "idle") {
        setTimeout(
          () => {
            setUnitStates((prev) => ({ ...prev, [unitId]: "idle" }));
          },
          action === "attack" ? 1000 : 500
        ); // Animation durations
      }
    },
    []
  );

  // Reset view to center
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setTransform("scale(1) translate(0, 0)");
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden" ref={containerRef}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          className="bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700"
          onClick={() => {
            const newZoom = Math.min(2.0, zoom + 0.1);
            setZoom(newZoom);
            setTransform(`scale(${newZoom}) translate(${pan.x}px, ${pan.y}px)`);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          className="bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700"
          onClick={() => {
            const newZoom = Math.max(0.5, zoom - 0.1);
            setZoom(newZoom);
            setTransform(`scale(${newZoom}) translate(${pan.x}px, ${pan.y}px)`);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          className="bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700"
          onClick={resetView}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* Main SVG Canvas */}
      <div
        className={`w-full h-full ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          style={{ transform }}
          className="transition-transform duration-100"
        >
          <defs>
            {/* Define additional effects like drop shadows */}
            <filter
              id="drop-shadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="4"
                floodColor="#000"
                floodOpacity="0.3"
              />
            </filter>

            {/* Glow filter for the dividing line */}
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* 3D effect for hexagons */}
            <linearGradient id="hex-top" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Define patterns for terrain types */}
            <pattern
              id="plains-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href="/assets/terrains/plains.png"
                width="1000"
                height="1000"
              />
            </pattern>

            <pattern
              id="forest-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href="/assets/terrains/forest.png"
                width="1000"
                height="1000"
              />
            </pattern>

            <pattern
              id="mountain-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href="/assets/terrains/mountain.png"
                width="200"
                height="200"
              />
            </pattern>

            <pattern
              id="water-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href="/assets/terrains/water.png"
                width="300"
                height="300"
              />
            </pattern>

            <pattern
              id="desert-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href="/assets/terrains/desert.png"
                width="100"
                height="100"
              />
            </pattern>

            <pattern
              id="swamp-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href="/assets/terrains/swamp.png"
                width="150"
                height="150"
              />
            </pattern>

            <pattern
              id="healing-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image
                href="/assets/terrains/healing.png"
                width="100"
                height="100"
              />
            </pattern>
          </defs>

          {/* Dividing Line between player and AI sides */}
          {showDividingLine && (
            <line
              x1="0"
              y1={gridBoundaries.minY}
              x2="0"
              y2={gridBoundaries.maxY}
              stroke="rgba(255, 215, 0, 0.7)"
              strokeWidth="1"
              strokeDasharray="10,5"
              filter="url(#glow)"
              className="animate-pulse"
            />
          )}

          {/* Territory Indicators */}
          {showDividingLine && (
            <>
              {/* Player territory label */}
              <text
                x={-100}
                y={gridBoundaries.minY + 50}
                fontSize="24"
                fill="#3b82f6"
                fontWeight="bold"
                textAnchor="middle"
                filter="url(#drop-shadow)"
              >
                YOUR TERRITORY
              </text>

              {/* AI territory label */}
              <text
                x={100}
                y={gridBoundaries.minY + 50}
                fontSize="24"
                fill="#ef4444"
                fontWeight="bold"
                textAnchor="middle"
                filter="url(#drop-shadow)"
              >
                ENEMY TERRITORY
              </text>
            </>
          )}

          {/* Render all tiles */}
          {tiles.map((tile) => {
            const { x, y } = calculateHexPosition(tile.position, size);
            const isSelected =
              selectedTile?.position.q === tile.position.q &&
              selectedTile?.position.r === tile.position.r;

            const isHighlighted = highlightedTiles.some(
              (pos) => pos.q === tile.position.q && pos.r === tile.position.r
            );

            const isPlacementTile = placementPositions.some(
              (pos) => pos.q === tile.position.q && pos.r === tile.position.r
            );
            const isAttackTarget = possibleAttacks.some(
              (pos) => pos.q === tile.position.q && pos.r === tile.position.r
            );

            // Add player/ai side visualization with colored borders
            const sideClass =
              tile.position.q < 0
                ? "player-side"
                : tile.position.q > 0
                ? "ai-side"
                : "neutral";

            // Set border color based on side
            const borderColor =
              tile.position.q < 0
                ? "rgba(59, 130, 246, 0.8)" // player blue - increased opacity
                : tile.position.q > 0
                ? "rgba(239, 68, 68, 0.8)" // enemy red - increased opacity
                : "rgba(107, 114, 128, 0.6)"; // neutral gray

            // Calculate hex sides for 3D effect
            const points = getHexPoints(size);
            const height = size * 0.15; // Side height for 3D effect

            return (
              <g
                key={`${tile.position.q},${tile.position.r}`}
                transform={`translate(${x}, ${y})`}
                onClick={() => onTileClick(tile)}
                className={`cursor-pointer transition-all duration-200 hover:brightness-110 ${sideClass}`}
                data-position={`${tile.position.q},${tile.position.r}`}
              >
                {/* 3D Hex Bottom (shadow) */}
                <polygon
                  points={points}
                  fill="#000"
                  fillOpacity="0.3"
                  transform={`translate(${size * 0.05}, ${size * 0.05})`}
                />

                {/* 3D Hex Sides */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle1 = (Math.PI / 180) * (60 * i);
                  const angle2 = (Math.PI / 180) * (60 * (i + 1));
                  const x1 = size * Math.cos(angle1);
                  const y1 = size * Math.sin(angle1);
                  const x2 = size * Math.cos(angle2);
                  const y2 = size * Math.sin(angle2);

                  // Only render sides that are facing "down" (bottom half of hex)
                  if (y1 >= 0 || y2 >= 0) {
                    return (
                      <polygon
                        key={i}
                        points={`${x1},${y1} ${x2},${y2} ${x2},${
                          y2 + height
                        } ${x1},${y1 + height}`}
                        fill={`rgba(0,0,0,0.5)`}
                        opacity="0.7"
                        className="z-0"
                      />
                    );
                  }
                  return null;
                })}

                {/* Main Hex Top */}
                <polygon
                  points={points}
                  fill={`url(#${tile.terrain.type}-pattern)`}
                  filter="url(#drop-shadow)"
                  className="z-10"
                />

                {/* Hex Top Highlight */}
                <polygon
                  points={points}
                  fill="url(#hex-top)"
                  className="pointer-events-none "
                />

                {/* Selection/Highlight Border - Moved to appear on top of everything */}
                <polygon
                  points={points}
                  fill="none"
                  className={`${
                    isSelected
                      ? "stroke-yellow-400 stroke-[2px]"
                      : isHighlighted
                      ? "stroke-green-400 stroke-[2px]"
                      : isPlacementTile
                      ? "stroke-blue-400 stroke-[2px] stroke-dasharray-4"
                      : "stroke-gray-800 stroke-[1px]"
                  }`}
                  pointerEvents="none"
                />
                {isAttackTarget && (
                  <g>
                    {/* Red attack target indicator */}
                    <circle
                      r={size * 0.7}
                      fill="none"
                      stroke="rgba(220, 38, 38, 0.7)"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                    {/* Crosshair */}
                    <line
                      x1={-size * 0.2}
                      y1="0"
                      x2={size * 0.2}
                      y2="0"
                      stroke="rgba(220, 38, 38, 0.9)"
                      strokeWidth="2"
                    />
                    <line
                      x1="0"
                      y1={-size * 0.2}
                      x2="0"
                      y2={size * 0.2}
                      stroke="rgba(220, 38, 38, 0.9)"
                      strokeWidth="2"
                    />
                  </g>
                )}
                {/* Territory indicator (improved borders) - Must be last to appear above all */}
                <polygon
                  points={points}
                  fill="none"
                  stroke={borderColor}
                  strokeWidth="2"
                  strokeOpacity="0.9"
                  pointerEvents="none"
                />

                {/* Render fortress if present */}
                {tile.fortress && renderFortress(tile.fortress, size)}

                {/* Render unit if present */}
                {tile.unit &&
                  renderUnit(
                    tile.unit,
                    size,
                    unitStates[tile.unit.instanceId] || "idle",
                    () => simulateUnitAction(tile.unit!.instanceId, "attack"),
                    unitAnimations
                  )}

                {/* Placement indicator when a card is selected */}
                {isPlacementTile && (
                  <circle
                    r={size * 0.7}
                    fill="rgba(0, 100, 255, 0.2)"
                    stroke="rgba(0, 100, 255, 0.5)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// Render fortress with 3D effect
const renderFortress = (fortress: any, size: number) => {
  const fortressColor =
    fortress.owner === "player" ? "rgba(0,100,255,0.8)" : "rgba(255,50,50,0.8)";
  const healthPercentage = (fortress.health / fortress.maxHealth) * 100;

  return (
    <g className="fortress" filter="url(#drop-shadow)">
      {/* Fortress Base */}
      <polygon
        points={`0,${-size / 3} ${size / 2},0 0,${size / 3} ${-size / 2},0`}
        fill={fortressColor}
        stroke="black"
        strokeWidth="2"
      />

      {/* Fortress Tower */}
      <rect
        x={-size / 6}
        y={-size / 2}
        width={size / 3}
        height={size / 3}
        fill={fortressColor}
        stroke="black"
        strokeWidth="1"
      />

      {/* Fortress 3D Details */}
      <rect
        x={-size / 6}
        y={-size / 2}
        width={size / 3}
        height={size / 12}
        fill="rgba(255,255,255,0.3)"
      />

      <polygon
        points={`0,${-size / 3} ${size / 2},0 ${size / 2},${size / 10} 0,${
          -size / 3 + size / 10
        }`}
        fill="rgba(255,255,255,0.2)"
      />

      <polygon
        points={`0,${-size / 3} ${-size / 2},0 ${-size / 2},${size / 10} 0,${
          -size / 3 + size / 10
        }`}
        fill="rgba(0,0,0,0.2)"
      />

      {/* Improved Fortress Health Bar with Background */}
      <rect
        x={-size / 2}
        y={size / 3 + 4}
        width={size}
        height={10}
        rx={5}
        fill="rgba(0,0,0,0.8)"
        stroke="#333"
        strokeWidth="1"
      />
      <rect
        x={-size / 2}
        y={size / 3 + 4}
        width={(size * healthPercentage) / 100}
        height={10}
        rx={5}
        fill={
          healthPercentage > 60
            ? "rgba(16,185,129,0.9)" // Green
            : healthPercentage > 30
            ? "rgba(245,158,11,0.9)" // Yellow
            : "rgba(239,68,68,0.9)" // Red
        }
      />

      {/* Owner badge */}
      <circle
        cx={-size / 2 - 10}
        cy={-size / 3 - 10}
        r={size / 10}
        fill={fortress.owner === "player" ? "#3b82f6" : "#ef4444"}
        stroke="white"
        strokeWidth="1"
      />

      {/* Health Text */}
      <text
        x={0}
        y={size / 3 + 9}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 5}
        fill="white"
        fontWeight="bold"
        className="pointer-events-none"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,1)" }}
      >
        {fortress.health}
      </text>
    </g>
  );
};

// Render unit with animations and direction support
const renderUnit = (
  unit: CardInstance,
  size: number,
  defaultState: "idle" | "attack" | "walk",
  onAttack: () => void,
  unitAnimations?: Record<string, UnitAnimation>
) => {
  const unitSize = size * 0.7;
  const healthPercentage = (unit.health / unit.maxHealth) * 100;

  // Get animation state from unitAnimations if available
  const animation = unitAnimations?.[unit.instanceId];
  const animationState: "idle" | "attack" | "walk" =
    animation?.state || defaultState;

  // Determine direction - default to right, but check animations
  const direction = animation?.direction || "right";
  const facingLeft = direction === "left";

  // Mapping unit type to asset paths
  const getUnitAssets = (type: CardType) => {
    // Base assets path - in a real implementation, this would be different for each unit type
    // const basePath = `/assets/units/${type}_`;
    const basePath = `/assets/units/warrior_1_`;

    return {
      idle: `${basePath}idle.gif`,
      attack: `${basePath}attack.gif`,
      walk: `${basePath}walking.gif`,
    };
  };

  const assets = getUnitAssets(unit.type);

  return (
    <g
      className="unit"
      onClick={(e) => {
        e.stopPropagation();
        onAttack();
      }}
    >
      {/* Unit Base Circle with team color ring */}
      <circle
        r={unitSize / 1.6}
        cy={unitSize / 10}
        fill={
          unit.owner === "player"
            ? "rgba(59,130,246,0.2)"
            : "rgba(239,68,68,0.2)"
        }
        stroke={
          unit.owner === "player"
            ? "rgba(59,130,246,0.5)"
            : "rgba(239,68,68,0.5)"
        }
        strokeWidth="3"
        filter="url(#drop-shadow)"
      />

      <circle
        r={unitSize / 1.8}
        cy={unitSize / 10}
        fill="rgba(0,0,0,0.3)"
        filter="url(#drop-shadow)"
      />

      {/* Unit Character Image with direction support */}
      <foreignObject
        x={-unitSize / 2}
        y={-unitSize / 1.5}
        width={unitSize}
        height={unitSize * 1.5}
        className="pointer-events-none overflow-visible"
      >
        <div className="w-full h-full overflow-visible scale-150">
          <img
            src={assets[animationState]}
            alt={unit.name}
            style={{
              width: "100%",
              height: "100%",
              transform: facingLeft ? "scaleX(-1)" : "none",
              transformOrigin: "center",
            }}
          />
        </div>
      </foreignObject>

      {/* Improved Unit Health Bar with Background */}
      <rect
        x={-unitSize / 2}
        y={unitSize / 3}
        width={unitSize}
        height={10}
        rx={5}
        fill="rgba(0,0,0,0.8)"
        stroke="#333"
        strokeWidth="1"
      />
      <rect
        x={-unitSize / 2}
        y={unitSize / 3}
        width={(unitSize * healthPercentage) / 100}
        height={10}
        rx={5}
        fill={
          healthPercentage > 60
            ? "rgba(16,185,129,0.9)" // Green
            : healthPercentage > 30
            ? "rgba(245,158,11,0.9)" // Yellow
            : "rgba(239,68,68,0.9)" // Red
        }
      />

      {/* Add health text to match fortress */}
      <text
        x={0}
        y={unitSize / 3 + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={unitSize / 6}
        fill="white"
        fontWeight="bold"
        className="pointer-events-none"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,1)" }}
      >
        {unit.health}
      </text>

      {/* Unit Stats Display - Better Positioned and Enlarged */}
      {/* Attack Value */}
      {/* <g
        transform={`translate(${-unitSize / 2 + 12}, ${-unitSize / 2 + 12})`}
        filter="url(#drop-shadow)"
      >
        <circle
          r={unitSize / 5}
          fill="rgba(220,38,38,0.9)"
          stroke="white"
          strokeWidth="2"
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={unitSize / 5}
          fill="white"
          fontWeight="bold"
          className="pointer-events-none"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
        >
          {unit.attack}
        </text>
      </g> */}

      {/* Range Indicator */}
      {/* <g
        transform={`translate(${unitSize / 2 - 12}, ${-unitSize / 2 + 12})`}
        filter="url(#drop-shadow)"
      >
        <circle
          r={unitSize / 5}
          fill="rgba(37,99,235,0.9)"
          stroke="white"
          strokeWidth="2"
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={unitSize / 5}
          fill="white"
          fontWeight="bold"
          className="pointer-events-none"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
        >
          {unit.range}
        </text>
      </g> */}

      {/* Enhanced Status Indicators (moved/attacked) */}
      <g transform="translate(0, 0)" pointerEvents="none">
        {unit.hasMoved && (
          <circle
            cx={-unitSize / 4}
            cy={-unitSize / 4}
            r={unitSize / 9}
            fill="rgba(75,85,99,0.8)"
            stroke="white"
            strokeWidth="1.5"
          >
            <title>Unit has moved</title>
          </circle>
        )}
        {unit.hasAttacked && (
          <circle
            cx={unitSize / 4}
            cy={-unitSize / 4}
            r={unitSize / 9}
            fill="rgba(75,85,99,0.8)"
            stroke="white"
            strokeWidth="1.5"
          >
            <title>Unit has attacked</title>
          </circle>
        )}
      </g>
    </g>
  );
};

export default HexGrid;
