import { Fortress } from "@/types/Fortress";
import React from "react";

interface FortressProps {
  fortress: Fortress;
  size: number;
}

const FortressComponent: React.FC<FortressProps> = ({ fortress, size }) => {
  const healthPercentage = (fortress.health / fortress.maxHealth) * 100;
  const fortressColor =
    fortress.owner === "player" ? "rgba(0,100,255,0.8)" : "rgba(255,50,50,0.8)";

  return (
    <svg>
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
          className="pointer-events-none text-shadow"
          style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.7)" }}
        >
          {fortress.health}
        </text>
      </g>
    </svg>
  );
};

export default FortressComponent;
