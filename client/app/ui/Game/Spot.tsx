import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import type { CardType } from "@cross-cribbs/shared-types/CardType";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import React, { useState } from "react";
import { motion } from "framer-motion";

type ChildProps = {
  pos: BoardPosition;
  card: CardType | null;
  turn: number;
  playCard: (pos: BoardPosition, turn: number) => void;
  isLastMove?: boolean;
};

export default function Spot({ pos, card, playCard, turn, isLastMove }: ChildProps) {
  const [isOver, setIsOver] = useState(false);

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    setIsOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    setIsOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsOver(false);
    const playerData = e.dataTransfer.getData("application/player");
    if (!playerData) return;

    const player: PlayerType = JSON.parse(playerData);
    if (player.num !== turn) return;

    playCard(pos, turn);
  }

  // Last move ring scales dynamically based on viewport size
  const lastMoveRing = isLastMove ? "ring-2 sm:ring-3 ring-amber-400 rounded-[8%]" : "";

  // Occupied Spot
  if (card) {
    return (
      <div className={`relative w-full aspect-[2.5/3.5] flex items-center justify-center isolate ${lastMoveRing}`}>
        {isLastMove ? (
          <motion.img
            key={`${pos[0]}-${pos[1]}`}
            initial={{ scale: 1.15, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="w-full h-full object-contain pointer-events-none drop-shadow-md select-none rounded-[8%]"
            src={card.frontImgSrc}
            alt={`${card.name} of ${card.suit}`}
            draggable={false}
          />
        ) : (
          <img
            className="w-full h-full object-contain pointer-events-none drop-shadow-md select-none rounded-[8%]"
            src={card.frontImgSrc}
            alt={`${card.name} of ${card.suit}`}
            draggable={false}
          />
        )}
      </div>
    );
  }

  // Empty Spot (border scales down on smaller screens for cleaner presentation)
  const emptySpotStyles = `relative w-full aspect-[2.5/3.5] rounded-[8%] border-[1.5px] sm:border-2 border-dashed ${
    isOver ? "border-amber-400 bg-amber-400/15 scale-[1.02]" : "border-slate-500/30 bg-slate-800/20"
  } hover:border-slate-400/50 hover:bg-slate-700/20 transition-all duration-150 cursor-pointer`;

  return (
    <div
      className={emptySpotStyles}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => playCard(pos, turn)}
    />
  );
}
