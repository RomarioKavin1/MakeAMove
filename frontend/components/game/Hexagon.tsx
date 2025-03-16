// src/components/game/Hexagon.tsx
import React from "react";
import Unit from "./Unit";
import FortressComponent from "./Fortress";
import { HexTile } from "@/types/Terrain";

interface HexagonProps {
  tile: HexTile;
  size: number;
  x: number;
  y: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}

const Hexagon: React.FC<HexagonProps> = ({
  tile,
  size,
  x,
  y,
  isSelected,
  isHighlighted,
  onClick,
}) => {
  // Calculate points for hexagon shape
  const points = Array(6)
    .fill(0)
    .map((_, i) => {
      const angleDeg = 60 * i - 30;
      const angleRad = (Math.PI / 180) * angleDeg;
      const pointX = size * Math.cos(angleRad);
      const pointY = size * Math.sin(angleRad);
      return `${pointX},${pointY}`;
    })
    .join(" ");

  // Determine styling based on terrain type
  const getTerrainStyles = () => {
    const styles: React.CSSProperties = {};

    // Background image based on terrain type
    styles.backgroundImage = `url(/assets/terrains/${tile.terrain.type}.png)`;
    styles.backgroundSize = "cover";
    styles.backgroundPosition = "center";

    return styles;
  };

  // Determine border styling
  const getBorderStyles = () => {
    if (isSelected) return "stroke-yellow-400 stroke-[1px]";
    if (isHighlighted) return "stroke-green-400 stroke-[1px]";
    return "stroke-gray-700 stroke-[1px]";
  };

  return (
    <svg>
      <g
        transform={`translate(${x}, ${y})`}
        onClick={onClick}
        className="cursor-pointer transition-all duration-200 hover:brightness-110"
      >
        {/* Hexagon shape */}
        <polygon
          points={points}
          className={`${getBorderStyles()} fill-opacity-80`}
          style={getTerrainStyles()}
        />

        {/* Healing indicator for healing tiles */}
        {tile.terrain.type === "healing" && (
          <circle
            r={size / 4}
            fill="rgba(0,255,150,0.5)"
            className="animate-pulse"
          />
        )}

        {/* Render fortress if present */}
        {tile.fortress && (
          <FortressComponent fortress={tile.fortress} size={size} />
        )}

        {/* Render unit if present */}
        {tile.unit && <Unit unit={tile.unit} size={size * 0.7} />}

        {/* Coordinates display for debugging */}
        <text
          fontSize={size / 5}
          fill="white"
          textAnchor="middle"
          dy="-0.8em"
          className="pointer-events-none text-shadow"
          style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.7)" }}
        >
          {`${tile.position.q},${tile.position.r}`}
        </text>
      </g>
    </svg>
  );
};

export default Hexagon;
