// src/components/game/Card.tsx
import React from "react";
import { Card as CardType } from "@/types/Card";
import Image from "next/image";
import styles from "./Card.module.css";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  size?: "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isSelected = false,
  draggable = false,
  onDragStart,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-24 h-32",
    md: "w-32 h-44",
    lg: "w-40 h-56",
  };

  const rarityColors = {
    common: "from-gray-400 to-gray-600",
    uncommon: "from-green-400 to-green-600",
    rare: "from-blue-400 to-blue-600",
    legendary: "from-purple-400 to-purple-700",
  };

  // Get card image path based on card type
  const getCardImagePath = (cardType: string) => {
    // In a full implementation, this would return different images for each card type
    return `/assets/cards/${card.type}_1.png`;
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 
        ${
          isSelected
            ? "ring-4 ring-yellow-400 transform scale-105 shadow-xl shadow-blue-500/20"
            : "hover:shadow-lg hover:shadow-blue-500/10 hover:transform hover:scale-102"
        } 
        bg-gradient-to-b ${rarityColors[card.rarity]}
      `}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* Card Border & Frame - 3D Effect */}
      <div className="absolute inset-0.5 rounded-lg bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20"></div>
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10"></div>

      {/* Card Header */}
      <div className="px-2 py-1 bg-black bg-opacity-70 text-center relative z-10">
        <h3 className="text-white font-bold text-sm truncate">{card.name}</h3>
      </div>

      {/* Card Image */}
      <div className="h-1/2 relative overflow-hidden">
        <Image
          src={getCardImagePath(card.type)}
          alt={card.name}
          fill
          className="object-cover transform transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute top-0 left-0 bg-black bg-opacity-60 px-1 rounded-br text-xs text-white z-10">
          {card.type}
        </div>
        <div className="absolute top-0 right-0 px-1.5 py-0.5 rounded-bl bg-black bg-opacity-60 text-xs">
          <span
            className={`
            ${
              card.rarity === "legendary"
                ? "text-purple-300"
                : card.rarity === "rare"
                ? "text-blue-300"
                : card.rarity === "uncommon"
                ? "text-green-300"
                : "text-gray-300"
            }
          `}
          >
            {card.rarity}
          </span>
        </div>
      </div>

      {/* Card Stats - with enhanced 3D look */}
      <div className="p-1 bg-black bg-opacity-70 text-white text-xs flex justify-between">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1 shadow-sm shadow-red-300"></span>
          <span>{card.attack}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1 shadow-sm shadow-green-300"></span>
          <span>{card.health}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1 shadow-sm shadow-blue-300"></span>
          <span>{card.range}</span>
        </div>
      </div>

      {/* Card Description - with subtle scroll effect if too long */}
      <div className="p-1 bg-black bg-opacity-50 text-white text-xs max-h-1/4 overflow-y-auto">
        <p className="line-clamp-3">{card.description}</p>
      </div>

      {/* Special Ability (if exists) - with glow effect */}
      {card.specialAbility && (
        <div className="absolute bottom-0 left-0 right-0 bg-purple-800 bg-opacity-70 px-1 py-0.5 text-white text-xs">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-1 animate-pulse"></span>
            {card.specialAbility.name}
          </div>
        </div>
      )}

      {/* Card glow on selection */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg pointer-events-none z-0 animate-pulse">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-yellow-400/30 to-yellow-600/30"></div>
        </div>
      )}
    </div>
  );
};

export default Card;
