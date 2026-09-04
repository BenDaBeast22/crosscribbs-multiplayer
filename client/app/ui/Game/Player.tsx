import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import type { CardType } from "@cross-cribbs/shared-types/CardType";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";

type ChildProps = {
  name: string;
  player: PlayerType;
  turn: number;
  crib: CardType[];
  numPlayers: number;
  lobbyId: string | undefined;
  playerId: string | undefined;
  dealer: number | null;
};

const PLAYER_COLORS = [
  { outline: "outline-cyan-400", dot: "bg-cyan-400" },
  { outline: "outline-fuchsia-400", dot: "bg-fuchsia-400" },
  { outline: "outline-blue-800", dot: "bg-blue-800" },
  { outline: "outline-pink-800", dot: "bg-pink-800" },
];

function PlayerComponent({ name, player, turn, lobbyId, playerId, dealer }: ChildProps) {
  const { hand } = player;

  const card = hand.length > 0 ? hand[hand.length - 1] : null;
  const backImgSrc = `/cards/backs/red2.svg`;

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLImageElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/player", JSON.stringify(player));
    },
    [player],
  );

  const isMultiplayer = !!lobbyId;
  const isTurn = player.num === turn;
  const isPlayer = playerId === player.id;
  const isDraggable = isTurn && (!lobbyId || isPlayer);
  const isDealer = dealer !== null && dealer === player.num;
  const colors = PLAYER_COLORS[player.num - 1];

  const outlineStyle = useMemo(() => {
    return isTurn ? `outline-2 lg:outline-4 ${colors.outline}` : "outline-1 outline-slate-300/60";
  }, [colors.outline, isTurn]);

  const showFront = isMultiplayer ? isPlayer && !!card : isTurn && !!card;
  const frontImgSrc = card ? card.frontImgSrc : backImgSrc;
  const displayCardsLeft = card ? "" : "invisible";
  const displayCardImage = card ? "" : "invisible";

  /* Bumped up ~35-45% from the previous sizing so cards read clearly again */
  const cardImgClasses = `h-[9.5vh] md:h-[10.5vh] lg:h-[10.5vh] xl:h-[12.5vh] 2xl:h-[15vh] object-contain rounded-lg shadow-md`;

  return (
    <div
      className={`flex flex-col items-center bg-gradient-to-br from-slate-100 to-slate-200 w-[76px] lg:w-36 px-1.5 py-1.5 lg:px-3 lg:py-2.5 rounded-xl ${outlineStyle} outline transition-all duration-300 shadow-lg shrink-0 overflow-hidden`}
    >
      {/*
        Header — 3-column grid keeps the name mathematically centered no matter
        how many badges are active. Left slot (dot) and right slot (badges) are
        both fixed-width and equal, so the center column's centering never drifts.
      */}
      <div className="grid grid-cols-[14px_1fr_14px] lg:grid-cols-[16px_1fr_16px] items-center w-full mb-1 lg:mb-2">
        <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${colors.dot}`} aria-hidden="true" />

        <h1 className="min-w-0 text-center text-xs lg:text-base font-bold text-gray-800 truncate px-0.5" title={name}>
          {name}
        </h1>

        {/* Right slot: badges stack here if present, otherwise stays empty to balance the dot */}
        <div className="flex items-center justify-end gap-0.5">
          {isDealer && (
            <span
              className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-amber-400 text-black text-[7px] lg:text-[8px] font-bold flex items-center justify-center"
              title="Dealer"
            >
              D
            </span>
          )}
          {lobbyId && isPlayer && (
            <span
              className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-emerald-400 text-black text-[7px] lg:text-[8px] font-bold flex items-center justify-center"
              title="You"
            >
              Y
            </span>
          )}
          {player.disconnected && (
            <span
              className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-red-500 text-white text-[7px] lg:text-[8px] font-bold flex items-center justify-center"
              title="Disconnected"
            >
              !
            </span>
          )}
        </div>
      </div>

      {/* Flip-card container */}
      <div
        className={`${displayCardImage} relative cursor-pointer transition-transform hover:scale-105`}
        style={{ perspective: 1000 }}
        draggable={isDraggable}
        onDragStart={handleDragStart}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: showFront ? 180 : 0 }}
          transition={{ duration: showFront ? 0.45 : 0, ease: "easeInOut" }}
        >
          {/* Back face */}
          <img
            className={`${cardImgClasses} absolute inset-0`}
            style={{ backfaceVisibility: "hidden" }}
            src={backImgSrc}
            alt=""
            draggable={false}
          />
          {/* Front face */}
          <img
            className={`${cardImgClasses} absolute inset-0`}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            src={frontImgSrc}
            alt=""
            draggable={false}
          />
          <img className={`${cardImgClasses} invisible`} src={backImgSrc} alt="" />
        </motion.div>
      </div>

      <p className={`${displayCardsLeft} text-[8px] lg:text-xs font-medium text-gray-600 mt-1`}>{hand.length} left</p>
    </div>
  );
}

export default React.memo(PlayerComponent, (prev, next) => {
  return (
    prev.player.hand === next.player.hand &&
    prev.turn === next.turn &&
    prev.player.num === next.player.num &&
    prev.crib === next.crib &&
    prev.dealer === next.dealer
  );
});
