/*
- Spot component:
  - Handles drag and drop functionality
  - Shows either an empty spot or a played card
  - Manages card placement logic
*/

import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import type { CardSizesType, CardType } from "@cross-cribbs/shared-types/CardType";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import { useState } from "react";
import { motion } from "framer-motion"; 

type ChildProps = {
  pos: BoardPosition;
  card: CardType | null;
  turn: number;
  cardSizes: CardSizesType;
  playCard: (pos: BoardPosition, turn: number) => void;
  isLastMove?: boolean;
};

export default function Spot({ pos, card, playCard, turn, cardSizes, isLastMove }: ChildProps) {
  const [isOver, setIsOver] = useState(false);

  function handleDragOver(e: any) {
    e.stopPropagation();
    e.preventDefault();
    setIsOver(true);
  }

  function handleDragLeave(e: any) {
    e.stopPropagation();
    e.preventDefault();
    setIsOver(false);
  }

  function handleDrop(e: any) {
    e.preventDefault();
    const playerData = e.dataTransfer.getData("application/player");
    if (!playerData) return;
    if (playerData) {
      const player: PlayerType = JSON.parse(playerData);
      console.log("Dropped player:", player);
      if (player.num !== turn) {
        return;
      }
    }
    playCard(pos, turn);
  }

  const placeholderImage = "/cards/fronts/clubs_2.svg";
  // subtler hover and border, with rounded corners
  const hover = "hover:bg-stone-300";
  // NEW — ring highlight when this spot was the most recent move
  const lastMoveRing = isLastMove ? "outline outline-2 md:outline-4 outline-amber-400 outline-offset-1" : "";
  const cardSpotStyles = `${isOver ? "bg-stone-300" : "bg-stone-200"} ${cardSizes.base} ${cardSizes.md} ${cardSizes.xl} border border-stone-300 rounded-md ${hover} ${lastMoveRing} transition duration-300 cursor-pointer`;

  if (card) {
    return (
      <td className={cardSpotStyles} onDragStart={(e) => (e.dataTransfer.effectAllowed = "move")}>
        {isLastMove ? (
          <motion.img
            key={`${pos[0]}-${pos[1]}`} // safe here: only this ONE card remounts per move, not a rapid tick loop
            initial={{ scale: 1.3, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="h-full"
            src={card.frontImgSrc}
            alt=""
            draggable="false"
          />
        ) : (
          <img className="h-full" src={card.frontImgSrc} alt="" draggable="false" />
        )}
      </td>
    );
  }

  return (
    <td
      className={cardSpotStyles}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => playCard(pos, turn)}
    >
      <img className="h-full invisible" src={placeholderImage} alt="" draggable="false" />
    </td>
  );
}