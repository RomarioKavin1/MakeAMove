// src/components/game/BattleControls.tsx
import React from "react";

interface BattleControlsProps {
  onEndTurn: () => void;
  isPlayerTurn: boolean;
}

const BattleControls: React.FC<BattleControlsProps> = ({
  onEndTurn,
  isPlayerTurn,
}) => {
  return (
    <div className="bg-gray-800 bg-opacity-80 p-3 rounded-lg shadow-lg backdrop-blur">
      <button
        className={`
          px-6 py-2 rounded-md font-bold text-sm 
          ${
            isPlayerTurn
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }
        `}
        onClick={isPlayerTurn ? onEndTurn : undefined}
        disabled={!isPlayerTurn}
      >
        {isPlayerTurn ? "End Turn" : "AI Turn"}
      </button>
    </div>
  );
};

export default BattleControls;
