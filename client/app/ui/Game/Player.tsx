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
  const colors = PLAYER_COLORS[(player.num - 1) % PLAYER_COLORS.length];

  const outlineStyle = useMemo(() => {
    return isTurn ? `outline-2 lg:outline-4 ${colors.outline}` : "outline-1 outline-slate-300/80";
  }, [colors.outline, isTurn]);

  // Clean background gradient without player-turn tints
  const bgGradient = "bg-gradient-to-br from-slate-100 to-slate-200";

  const showFront = isMultiplayer ? isPlayer && !!card : isTurn && !!card;
  const frontImgSrc = card ? card.frontImgSrc : backImgSrc;
  const displayCardsLeft = card ? "" : "invisible";
  const displayCardImage = card ? "" : "invisible";

  /* Shrunk for mobile/sm, lg+ sizing unchanged */
  const cardImgClasses = `h-[6.5vh] sm:h-[7.5vh] md:h-[9vh] lg:h-[11vh] xl:h-[12.5vh] 2xl:h-[15vh] object-contain rounded-lg shadow-md`;

  return (
    <div
      className={`
        relative flex flex-col items-center ${bgGradient}
        w-[58px] sm:w-20 md:w-24 lg:w-36 px-1 py-0.5 lg:py-1 lg:px-2.5 lg:pt-1.5 lg:pb-2.5 rounded-lg lg:rounded-xl 
        ${outlineStyle} outline transition-all duration-300 shadow-md lg:shadow-lg shrink-0 overflow-hidden select-none
      `}
    >
      {/* 1. Header: Color Dot top-left; Name centered */}
      <div className="relative flex items-center justify-center w-full min-w-0 mb-0.5 lg:mb-1 px-0.5 lg:px-1">
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 lg:w-2 lg:h-2 rounded-full shrink-0 ${colors.dot}`}
          aria-hidden="true"
        />
        <h1
          className="w-full text-center text-[9px] sm:text-[10px] md:text-xs lg:text-base font-bold text-slate-800 truncate lg:px-1"
          title={name}
        >
          {name}
        </h1>
      </div>

      {/* 2. Flip-card container */}
      <div
        className={`${displayCardImage} relative cursor-pointer transition-transform hover:scale-105 active:scale-95`}
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

      {/* 3. Hand Count */}
      <p
        className={`${displayCardsLeft} text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs font-semibold text-slate-600 mt-0.5 lg:mt-1`}
      >
        {hand.length} left
      </p>

      {/* 4. Badges Footer: Fixed height wrapper preserves uniform card dimensions */}
      <div className="flex items-center justify-center gap-0.5 lg:gap-1 w-full lg:mt-1 min-h-[10px] lg:min-h-[20px]">
        {isMultiplayer && isPlayer && (
          <span
            className="bg-emerald-600 text-white font-black text-[5px] sm:text-[6px] md:text-[7px] lg:text-[10px] px-0.5 py-0.2 lg:px-1.5 lg:py-0.5 rounded uppercase tracking-tight shadow-xs"
            title="You"
          >
            YOU
          </span>
        )}

        {isDealer && (
          <span
            className="bg-amber-400 text-slate-900 font-black text-[5px] sm:text-[6px] md:text-[7px] lg:text-[10px] px-0.5 py-0.2 lg:px-1.5 lg:py-0.5 rounded shadow-xs"
            title="Dealer"
          >
            <span>DEALER</span>
          </span>
        )}

        {player.disconnected && (
          <span
            className="bg-red-500 text-white font-bold text-[5px] sm:text-[6px] md:text-[7px] lg:text-[10px] px-0.5 py-0.2 lg:px-1.5 lg:py-0.5 rounded shadow-xs"
            title="Disconnected"
          >
            <span>DC</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default React.memo(PlayerComponent, (prev, next) => {
  return (
    prev.player.hand === next.player.hand &&
    prev.turn === next.turn &&
    prev.player.num === next.player.num &&
    prev.crib === next.crib &&
    prev.dealer === next.dealer &&
    prev.player.disconnected === next.player.disconnected
  );
});
