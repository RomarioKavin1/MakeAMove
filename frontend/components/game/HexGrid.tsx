// src/components/game/HexGrid.tsx
import React, { useEffect, useState, useRef } from "react";
import { calculateHexPosition } from "@/lib/hexUtils";
import { HexTile } from "@/types/Terrain";
import { Position } from "@/types/Game";

interface HexGridProps {
  tiles: HexTile[];
  onTileClick: (tile: HexTile) => void;
  selectedTile?: HexTile;
  highlightedTiles?: Position[];
  size: number;
}

const HexGrid: React.FC<HexGridProps> = ({
  tiles,
  onTileClick,
  selectedTile,
  highlightedTiles = [],
  size,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState("-500 -400 1000 800");

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

    setViewBox(`${minX} ${minY} ${width} ${height}`);
  }, [tiles, size]);

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

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Define patterns for terrain types */}
          <pattern
            id="plains-pattern"
            patternUnits="userSpaceOnUse"
            width="30"
            height="30"
            patternTransform="rotate(45)"
          >
            <rect width="30" height="30" fill="#a3c095" />
            <path
              d="M0 0 L10 0 L5 5 Z"
              fill="#8aaf7a"
              transform="translate(10,10)"
            />
          </pattern>

          <pattern
            id="forest-pattern"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <rect width="20" height="20" fill="#2e6930" />
            <circle cx="10" cy="10" r="5" fill="#1d4d1d" />
          </pattern>

          <pattern
            id="mountain-pattern"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <rect width="20" height="20" fill="#8b7355" />
            <path d="M0 20 L10 0 L20 20 Z" fill="#6d5a43" />
          </pattern>

          <pattern
            id="water-pattern"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <rect width="20" height="20" fill="#4682B4" />
            <path
              d="M0 10 Q5 5, 10 10 T 20 10"
              stroke="#3a6d96"
              fill="none"
              strokeWidth="2"
            />
          </pattern>

          <pattern
            id="desert-pattern"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <rect width="20" height="20" fill="#e9c98f" />
            <circle cx="5" cy="5" r="1" fill="#be9c69" />
            <circle cx="15" cy="15" r="1" fill="#be9c69" />
          </pattern>

          <pattern
            id="swamp-pattern"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <rect width="20" height="20" fill="#5a603f" />
            <circle cx="10" cy="10" r="3" fill="#404626" />
          </pattern>

          <pattern
            id="healing-pattern"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <rect width="20" height="20" fill="#90e0ef" />
            <path
              d="M8 5 L12 5 L12 8 L15 8 L15 12 L12 12 L12 15 L8 15 L8 12 L5 12 L5 8 L8 8 Z"
              fill="#48cae4"
            />
          </pattern>
        </defs>

        {tiles.map((tile) => {
          const { x, y } = calculateHexPosition(tile.position, size);
          const isSelected =
            selectedTile?.position.q === tile.position.q &&
            selectedTile?.position.r === tile.position.r;

          const isHighlighted = highlightedTiles.some(
            (pos) => pos.q === tile.position.q && pos.r === tile.position.r
          );

          // Add player/ai side visualization
          const sideClass =
            tile.position.q < 0
              ? "player-side"
              : tile.position.q > 0
              ? "ai-side"
              : "neutral";

          return (
            <g
              key={`${tile.position.q},${tile.position.r}`}
              transform={`translate(${x}, ${y})`}
              onClick={() => onTileClick(tile)}
              className={`cursor-pointer transition-all duration-200 hover:brightness-110 ${sideClass}`}
              data-position={`${tile.position.q},${tile.position.r}`}
            >
              {/* Hexagon shape */}
              <polygon
                points={getHexPoints(size)}
                className={`${
                  isSelected
                    ? "stroke-yellow-400 stroke-[3px]"
                    : isHighlighted
                    ? "stroke-green-400 stroke-[2px]"
                    : "stroke-gray-700 stroke-[1px]"
                }`}
                fill={`url(#${tile.terrain.type}-pattern)`}
              />

              {/* Coordinates display for debugging */}
              <text
                fontSize={size / 5}
                fill="white"
                textAnchor="middle"
                dy="-0.8em"
                className="pointer-events-none"
                style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.7)" }}
              >
                {`${tile.position.q},${tile.position.r}`}
              </text>

              {/* Render fortress if present */}
              {tile.fortress && renderFortress(tile.fortress, size)}

              {/* Render unit if present */}
              {tile.unit && renderUnit(tile.unit, size)}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Render fortress
const renderFortress = (fortress: any, size: number) => {
  const fortressColor =
    fortress.owner === "player" ? "rgba(0,100,255,0.8)" : "rgba(255,50,50,0.8)";
  const healthPercentage = (fortress.health / fortress.maxHealth) * 100;

  return (
    <g className="fortress">
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

      {/* Fortress Health Bar */}
      <rect
        x={-size / 2}
        y={size / 3 + 4}
        width={size}
        height={6}
        rx={3}
        fill="rgba(0,0,0,0.7)"
      />
      <rect
        x={-size / 2}
        y={size / 3 + 4}
        width={(size * healthPercentage) / 100}
        height={6}
        rx={3}
        fill={
          healthPercentage > 60
            ? "rgba(0,255,0,0.8)"
            : healthPercentage > 30
            ? "rgba(255,255,0,0.8)"
            : "rgba(255,0,0,0.8)"
        }
      />

      {/* Health Text */}
      <text
        x={0}
        y={size / 3 + 7}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 6}
        fill="white"
        fontWeight="bold"
        className="pointer-events-none"
        style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.7)" }}
      >
        {fortress.health}
      </text>
    </g>
  );
};

// Render unit
const renderUnit = (unit: any, size: number) => {
  const healthPercentage = (unit.health / unit.maxHealth) * 100;
  const unitSize = size * 0.7;

  return (
    <g className="unit">
      {/* Unit Circle */}
      <circle
        r={unitSize / 2}
        fill="rgba(0,0,0,0.5)"
        className="stroke-2"
        stroke={unit.canAct ? "white" : "gray"}
      />

      {/* Unit Icon (based on type) */}
      <circle r={unitSize / 2 - 2} fill={getUnitColor(unit.type)} />

      {/* Unit Type Icon */}
      {renderUnitTypeIcon(unit.type, unitSize / 2 - 4)}

      {/* Health Bar */}
      <rect
        x={-unitSize / 2}
        y={unitSize / 2 - 3}
        width={unitSize}
        height={4}
        rx={2}
        fill="rgba(0,0,0,0.7)"
      />
      <rect
        x={-unitSize / 2}
        y={unitSize / 2 - 3}
        width={(unitSize * healthPercentage) / 100}
        height={4}
        rx={2}
        fill={
          healthPercentage > 60
            ? "rgba(0,255,0,0.8)"
            : healthPercentage > 30
            ? "rgba(255,255,0,0.8)"
            : "rgba(255,0,0,0.8)"
        }
      />

      {/* Attack Value */}
      <circle
        cx={-unitSize / 2 + 5}
        cy={-unitSize / 2 + 5}
        r={unitSize / 6}
        fill="rgba(255,0,0,0.8)"
      />
      <text
        x={-unitSize / 2 + 5}
        y={-unitSize / 2 + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={unitSize / 7}
        fill="white"
        fontWeight="bold"
        className="pointer-events-none"
      >
        {unit.attack}
      </text>

      {/* Range Indicator */}
      <circle
        cx={unitSize / 2 - 5}
        cy={-unitSize / 2 + 5}
        r={unitSize / 6}
        fill="rgba(0,0,255,0.8)"
      />
      <text
        x={unitSize / 2 - 5}
        y={-unitSize / 2 + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={unitSize / 7}
        fill="white"
        fontWeight="bold"
        className="pointer-events-none"
      >
        {unit.range}
      </text>
    </g>
  );
};

// Render unit type icon
const renderUnitTypeIcon = (type: string, size: number) => {
  switch (type) {
    case "warrior":
      return (
        <path
          d="M0,-5 L5,5 L-5,5 Z"
          fill="white"
          transform={`scale(${size / 10})`}
        />
      );
    case "archer":
      return (
        <circle
          r={size / 2}
          fill="none"
          stroke="white"
          strokeWidth={size / 5}
        />
      );
    case "healer":
      return (
        <path
          d="M-5,0 L5,0 M0,-5 L0,5"
          stroke="white"
          strokeWidth={size / 5}
          strokeLinecap="round"
          transform={`scale(${size / 10})`}
        />
      );
    case "tank":
      return (
        <rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          fill="none"
          stroke="white"
          strokeWidth={size / 5}
        />
      );
    case "mage":
      return (
        <path
          d="M-5,-5 L5,5 M-5,5 L5,-5"
          stroke="white"
          strokeWidth={size / 5}
          strokeLinecap="round"
          transform={`scale(${size / 10})`}
        />
      );
    case "scout":
      return (
        <path
          d="M0,0 L0,-7 M-5,0 L5,0"
          stroke="white"
          strokeWidth={size / 5}
          strokeLinecap="round"
          transform={`scale(${size / 10})`}
        />
      );
    default:
      return null;
  }
};

// Get unit color based on type
const getUnitColor = (type: string): string => {
  const unitColors: Record<string, string> = {
    warrior: "#d00000",
    archer: "#6a994e",
    healer: "#7209b7",
    tank: "#1d3557",
    mage: "#7209b7",
    scout: "#f9c74f",
  };

  return unitColors[type] || "#cccccc";
};

export default HexGrid;
