// src/components/game/BattleControls.tsx
import React from "react";

interface BattleControlsProps {
  onEndTurn: () => void;
  onAttack?: () => void;
  isPlayerTurn: boolean;
  canAttack: boolean;
  attackTarget?: { q: number; r: number };
}

const BattleControls: React.FC<BattleControlsProps> = ({
  onEndTurn,
  onAttack,
  isPlayerTurn,
  canAttack,
  attackTarget,
}) => {
  return (
    <div className="flex flex-col bg-gray-800 p-3 rounded-lg shadow-lg space-y-3">
      {/* Attack button - show only when there's a valid target */}
      {canAttack && attackTarget && (
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md flex items-center justify-center transition-colors"
          onClick={onAttack}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          Attack
        </button>
      )}

      {/* End Turn button */}
      <button
        className={`${
          isPlayerTurn
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-600 cursor-not-allowed"
        } text-white px-6 py-2 rounded-md flex items-center justify-center transition-colors`}
        onClick={onEndTurn}
        disabled={!isPlayerTurn}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
        </svg>
        End Turn
      </button>
    </div>
  );
};

export default BattleControls;
