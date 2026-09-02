/*
- Spot component:
  - Handles drag and drop functionality
  - Renders cards cleanly without grey background boxes
  - Keeps stacking contexts isolated to prevent modal overlay bleed
*/

import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import type { CardSizesType, CardType } from "@cross-cribbs/shared-types/CardType";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import React, { useState } from "react";
import { motion } from "framer-motion";

type ChildProps = {
  pos: BoardPosition;
  card: CardType | null;
  turn: number;
  cardSizes?: CardSizesType;
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
    if (player.num !== turn) {
      return;
    }

    playCard(pos, turn);
  }

  // Last move indicator ring (removed z-10 so it stays beneath overlays)
  const lastMoveRing = isLastMove ? "ring-2 md:ring-3 ring-amber-400 rounded-md" : "";

  // Container styling for occupied spots: completely transparent background & border
  if (card) {
    return (
      <div
        className={`relative w-full h-full aspect-[2.5/3.5] flex items-center justify-center isolate ${lastMoveRing}`}
      >
        {isLastMove ? (
          <motion.img
            key={`${pos[0]}-${pos[1]}`}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
            src={card.frontImgSrc}
            alt={`${card.rank} of ${card.suit}`}
            draggable="false"
          />
        ) : (
          <img
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
            src={card.frontImgSrc}
            alt={`${card.rank} of ${card.suit}`}
            draggable="false"
          />
        )}
      </div>
    );
  }

  // Container styling for empty spots: subtle dashed outline / drop zone
  const emptySpotStyles = `relative w-full h-full aspect-[2.5/3.5] rounded-md border-2 border-dashed ${
    isOver ? "border-amber-400 bg-amber-400/10" : "border-slate-500/30 bg-slate-800/20"
  } hover:border-slate-400/50 hover:bg-slate-700/20 transition-all duration-200 cursor-pointer`;

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
