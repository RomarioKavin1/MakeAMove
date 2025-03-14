// src/components/game/Card.tsx
import React from "react";
import { Card as CardType } from "@/types/Card";
import Image from "next/image";

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

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 
        ${
          isSelected
            ? "ring-4 ring-yellow-400 transform scale-105"
            : "hover:shadow-lg hover:transform hover:scale-102"
        } 
        bg-gradient-to-b ${rarityColors[card.rarity]}
      `}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* Card Header */}
      <div className="px-2 py-1 bg-black bg-opacity-50 text-center">
        <h3 className="text-white font-bold text-sm truncate">{card.name}</h3>
      </div>

      {/* Card Image */}
      <div className="h-1/2 relative">
        <Image
          src={card.imageUrl}
          alt={card.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-0 left-0 bg-black bg-opacity-60 px-1 rounded-br text-xs text-white">
          {card.type}
        </div>
      </div>

      {/* Card Stats */}
      <div className="p-1 bg-black bg-opacity-30 text-white text-xs flex justify-between">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
          <span>{card.attack}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
          <span>{card.health}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
          <span>{card.range}</span>
        </div>
      </div>

      {/* Card Description */}
      <div className="p-1 text-white text-xs max-h-1/4 overflow-hidden">
        <p className="line-clamp-3">{card.description}</p>
      </div>

      {/* Special Ability (if exists) */}
      {card.specialAbility && (
        <div className="absolute bottom-0 left-0 right-0 bg-purple-800 bg-opacity-70 px-1 py-0.5 text-white text-xs">
          {card.specialAbility.name}
        </div>
      )}
    </div>
  );
};

export default Card;
