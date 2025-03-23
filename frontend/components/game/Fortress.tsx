import { Fortress } from "@/types/Fortress";
import React from "react";

interface FortressProps {
  fortress: Fortress;
  size: number;
}

const FortressComponent: React.FC<FortressProps> = ({ fortress, size }) => {
  const healthPercentage = (fortress.health / fortress.maxHealth) * 100;
  // More vibrant primary colors with better opacity
  const fortressColor =
    fortress.owner === "player"
      ? "rgba(30,120,255,0.9)"
      : "rgba(255,60,60,0.9)";
  // Richer secondary colors for depth
  const secondaryColor =
    fortress.owner === "player"
      ? "rgba(10,80,200,0.95)"
      : "rgba(200,30,30,0.95)";
  // Highlight colors for 3D effect
  const highlightColor =
    fortress.owner === "player"
      ? "rgba(120,180,255,0.9)"
      : "rgba(255,160,160,0.9)";
  // Shadow colors for 3D effect
  const shadowColor =
    fortress.owner === "player" ? "rgba(0,40,120,0.9)" : "rgba(120,20,20,0.9)";

  // For SVG filters and special effects
  const filterId = `fortress-shadow-${fortress.owner}`;
  const glowId = `fortress-glow-${fortress.owner}`;

  return (
    <svg>
      {/* Enhanced SVG filters for better shadowing and glow effects */}
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="2"
            dy="4"
            stdDeviation="3"
            floodColor="rgba(0,0,0,0.6)"
          />
        </filter>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={highlightColor} />
          <stop offset="70%" stopColor={fortressColor} />
          <stop offset="100%" stopColor={shadowColor} />
        </linearGradient>
        <linearGradient id="towerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={highlightColor} />
          <stop offset="60%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={shadowColor} />
        </linearGradient>
      </defs>

      <g className="fortress" filter={`url(#${filterId})`}>
        {/* Main Castle Base - Improved shape with gradient */}
        <polygon
          points={`0,${-size / 3} ${size / 2},0 0,${size / 3} ${-size / 2},0`}
          fill="url(#wallGradient)"
          stroke={shadowColor}
          strokeWidth="2"
        />

        {/* Castle Walls Detailing */}
        <line
          x1={-size / 4}
          y1={-size / 6}
          x2={size / 4}
          y2={-size / 6}
          stroke={shadowColor}
          strokeWidth="1"
          strokeDasharray="3,2"
        />
        <line
          x1={-size / 4}
          y1={size / 6}
          x2={size / 4}
          y2={size / 6}
          stroke={shadowColor}
          strokeWidth="1"
          strokeDasharray="3,2"
        />

        {/* Main Central Tower with gradient */}
        <rect
          x={-size / 6}
          y={-size / 2}
          width={size / 3}
          height={size / 2.3}
          fill="url(#towerGradient)"
          stroke={shadowColor}
          strokeWidth="1.5"
          rx={size / 30}
        />

        {/* Tower Top with Improved Battlements */}
        <path
          d={`M ${-size / 6} ${-size / 2}
              L ${-size / 6} ${-size / 2 - size / 15}
              L ${-size / 8} ${-size / 2 - size / 15}
              L ${-size / 8} ${-size / 2 - size / 10}
              L ${-size / 10} ${-size / 2 - size / 10}
              L ${-size / 10} ${-size / 2 - size / 15}
              L ${-size / 20} ${-size / 2 - size / 15}
              L ${-size / 20} ${-size / 2 - size / 10}
              L ${0} ${-size / 2 - size / 10}
              L ${0} ${-size / 2 - size / 15}
              L ${size / 20} ${-size / 2 - size / 15}
              L ${size / 20} ${-size / 2 - size / 10}
              L ${size / 10} ${-size / 2 - size / 10}
              L ${size / 10} ${-size / 2 - size / 15}
              L ${size / 8} ${-size / 2 - size / 15}
              L ${size / 8} ${-size / 2 - size / 10}
              L ${size / 6} ${-size / 2 - size / 10}
              L ${size / 6} ${-size / 2}
              Z`}
          fill={secondaryColor}
          stroke={shadowColor}
          strokeWidth="1"
        />

        {/* Decorative Tower Roof */}
        <polygon
          points={`${-size / 6 - size / 30},${-size / 2 - size / 15} 0,${
            -size / 2 - size / 5
          } ${size / 6 + size / 30},${-size / 2 - size / 15}`}
          fill={shadowColor}
          stroke={shadowColor}
          strokeWidth="1"
        />

        {/* Side Towers - Left with rounded corners */}
        <rect
          x={-size / 2 + size / 20}
          y={-size / 5}
          width={size / 6}
          height={size / 3}
          fill="url(#towerGradient)"
          stroke={shadowColor}
          strokeWidth="1"
          rx={size / 40}
        />

        {/* Left Tower Roof */}
        <polygon
          points={`${-size / 2 + size / 20},${-size / 5} ${
            -size / 2 + size / 20 + size / 12
          },${-size / 5 - size / 10} ${-size / 2 + size / 20 + size / 6},${
            -size / 5
          }`}
          fill={shadowColor}
          stroke={shadowColor}
          strokeWidth="1"
        />

        {/* Side Towers - Right with rounded corners */}
        <rect
          x={size / 2 - size / 20 - size / 6}
          y={-size / 5}
          width={size / 6}
          height={size / 3}
          fill="url(#towerGradient)"
          stroke={shadowColor}
          strokeWidth="1"
          rx={size / 40}
        />

        {/* Right Tower Roof */}
        <polygon
          points={`${size / 2 - size / 20 - size / 6},${-size / 5} ${
            size / 2 - size / 20 - size / 12
          },${-size / 5 - size / 10} ${size / 2 - size / 20},${-size / 5}`}
          fill={shadowColor}
          stroke={shadowColor}
          strokeWidth="1"
        />

        {/* Tower Windows with glow */}
        <rect
          x={-size / 12}
          y={-size / 2 + size / 10}
          width={size / 6}
          height={size / 12}
          fill="rgba(255,240,150,0.8)"
          stroke={shadowColor}
          strokeWidth="0.5"
          rx={size / 40}
          filter={`url(#${glowId})`}
        />

        {/* Side tower windows */}
        <rect
          x={-size / 2 + size / 20 + size / 24}
          y={-size / 5 + size / 10}
          width={size / 12}
          height={size / 15}
          fill="rgba(255,240,150,0.8)"
          stroke={shadowColor}
          strokeWidth="0.5"
          rx={size / 60}
          filter={`url(#${glowId})`}
        />

        <rect
          x={size / 2 - size / 20 - size / 6 + size / 24}
          y={-size / 5 + size / 10}
          width={size / 12}
          height={size / 15}
          fill="rgba(255,240,150,0.8)"
          stroke={shadowColor}
          strokeWidth="0.5"
          rx={size / 60}
          filter={`url(#${glowId})`}
        />

        {/* Enhanced Castle Door with arch */}
        <path
          d={`M ${-size / 14} ${-size / 4}
              A ${size / 14} ${size / 14} 0 0 1 ${size / 14} ${-size / 4}
              V ${-size / 4 + size / 8}
              H ${-size / 14}
              Z`}
          fill="rgba(80,50,20,0.9)"
          stroke={shadowColor}
          strokeWidth="0.8"
        />

        {/* Door details */}
        <line
          x1={0}
          y1={-size / 4}
          x2={0}
          y2={-size / 4 + size / 8}
          stroke={shadowColor}
          strokeWidth="0.5"
        />
        <line
          x1={-size / 14}
          y1={-size / 4 + size / 16}
          x2={size / 14}
          y2={-size / 4 + size / 16}
          stroke={shadowColor}
          strokeWidth="0.5"
        />

        {/* Enhanced Fortress Banner with animation */}
        <g transform={`translate(0, ${-size / 2 - size / 10})`}>
          <rect
            x={-size / 36}
            y={0}
            width={size / 18}
            height={size / 6}
            fill={
              fortress.owner === "player"
                ? "rgba(70,130,255,0.9)"
                : "rgba(255,70,70,0.9)"
            }
            stroke={shadowColor}
            strokeWidth="0.5"
          >
            <animate
              attributeName="y"
              values={`${-size / 40};${0};${-size / 40}`}
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>
          {/* Banner pole */}
          <line
            x1={0}
            y1={-size / 40}
            x2={0}
            y2={size / 4}
            stroke={shadowColor}
            strokeWidth="1"
          />
        </g>

        {/* Enhanced Health Bar with glowing effect */}
        <rect
          x={-size / 2}
          y={size / 3 + 4}
          width={size}
          height={8}
          rx={4}
          fill="rgba(0,0,0,0.8)"
          stroke="#333"
          strokeWidth="1"
        />
        <rect
          x={-size / 2}
          y={size / 3 + 4}
          width={(size * healthPercentage) / 100}
          height={8}
          rx={4}
          fill={
            healthPercentage > 60
              ? "rgba(16,185,129,0.9)" // Green
              : healthPercentage > 30
              ? "rgba(245,158,11,0.9)" // Yellow
              : "rgba(239,68,68,0.9)" // Red
          }
          filter={`url(#${glowId})`}
        />

        {/* Health Text with better shadow */}
        <text
          x={0}
          y={size / 3 + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size / 6}
          fill="white"
          fontWeight="bold"
          className="pointer-events-none text-shadow"
          style={{
            textShadow:
              "1px 1px 2px rgba(0,0,0,0.9), 0px 0px 5px rgba(0,0,0,0.5)",
          }}
        >
          {fortress.health}
        </text>

        {/* Improved Owner Badge with glow effect */}
        <circle
          cx={-size / 2 - 5}
          cy={-size / 3 - 5}
          r={size / 10}
          fill={fortress.owner === "player" ? "#3b82f6" : "#ef4444"}
          stroke="white"
          strokeWidth="1.5"
          filter={`url(#${glowId})`}
        />

        {/* Decorative elements - Small flags on side towers */}
        <g
          transform={`translate(${-size / 2 + size / 20 + size / 12}, ${
            -size / 5 - size / 8
          })`}
        >
          <rect
            width={size / 30}
            height={size / 20}
            fill={
              fortress.owner === "player"
                ? "rgba(70,130,255,0.9)"
                : "rgba(255,70,70,0.9)"
            }
          />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={size / 12}
            stroke={shadowColor}
            strokeWidth="0.5"
          />
        </g>

        <g
          transform={`translate(${size / 2 - size / 20 - size / 12}, ${
            -size / 5 - size / 8
          })`}
        >
          <rect
            width={size / 30}
            height={size / 20}
            fill={
              fortress.owner === "player"
                ? "rgba(70,130,255,0.9)"
                : "rgba(255,70,70,0.9)"
            }
          />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={size / 12}
            stroke={shadowColor}
            strokeWidth="0.5"
          />
        </g>
      </g>
    </svg>
  );
};

export default FortressComponent;
