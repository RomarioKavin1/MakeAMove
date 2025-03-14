import React from "react";
import { CardInstance } from "@/types/Card";
import Image from "next/image";

interface UnitProps {
  unit: CardInstance;
  size: number;
}

const Unit: React.FC<UnitProps> = ({ unit, size }) => {
  const healthPercentage = (unit.health / unit.maxHealth) * 100;

  return (
    <g className="unit">
      {/* Unit Circle */}
      <circle
        r={size / 2}
        fill="rgba(0,0,0,0.5)"
        className="stroke-2"
        stroke={unit.canAct ? "white" : "gray"}
      />

      {/* Unit Image */}
      <foreignObject
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        className="overflow-hidden rounded-full"
      >
        <div className="w-full h-full relative">
          <Image
            src={unit.imageUrl}
            alt={unit.name}
            fill
            className="object-cover"
          />
        </div>
      </foreignObject>

      {/* Health Bar */}
      <rect
        x={-size / 2}
        y={size / 2 - 3}
        width={size}
        height={4}
        rx={2}
        fill="rgba(0,0,0,0.7)"
      />
      <rect
        x={-size / 2}
        y={size / 2 - 3}
        width={(size * healthPercentage) / 100}
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
        cx={-size / 2 + 5}
        cy={-size / 2 + 5}
        r={size / 6}
        fill="rgba(255,0,0,0.8)"
      />
      <text
        x={-size / 2 + 5}
        y={-size / 2 + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 7}
        fill="white"
        fontWeight="bold"
        className="pointer-events-none"
      >
        {unit.attack}
      </text>

      {/* Range Indicator */}
      <circle
        cx={size / 2 - 5}
        cy={-size / 2 + 5}
        r={size / 6}
        fill="rgba(0,0,255,0.8)"
      />
      <text
        x={size / 2 - 5}
        y={-size / 2 + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 7}
        fill="white"
        fontWeight="bold"
        className="pointer-events-none"
      >
        {unit.range}
      </text>
    </g>
  );
};

export default Unit;
