import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import type { CardType } from "@cross-cribbs/shared-types/CardType";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import { getPlayerColor } from "~/helpers";

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

const PLAYER_OUTLINE_COLORS = ["outline-cyan-400", "outline-fuchsia-400", "outline-blue-800", "outline-pink-800"];

function PlayerComponent({ name, player, turn, numPlayers, lobbyId, playerId, dealer }: ChildProps) {
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

  const outlineStyle = useMemo(() => {
    const color = PLAYER_OUTLINE_COLORS[player.num - 1];
    return isTurn ? `outline-2 lg:outline-6 ${color}` : "outline-[1px] lg:outline-2 outline-stone-300";
  }, [player.num, isTurn]);

  const bgGradient = useMemo(() => "bg-gradient-to-br from-slate-100 to-slate-200", []);

  const showFront = isMultiplayer ? isPlayer && !!card : isTurn && !!card;
  const frontImgSrc = card ? card.frontImgSrc : backImgSrc;
  const displayCardsLeft = card ? "" : "invisible";
  const displayCardImage = card ? "" : "invisible";

  const cardImgClasses = `h-[7.05vh] md:h-[7.15vh] lg:h-[7.15vh] xl:h-[8.45vh] 2xl:h-[10.4vh] object-contain border-transparent border-[0.5px] lg:border-2 rounded-lg shadow-lg`;

  return (
    <div
      className={`flex flex-col justify-center ${bgGradient} max-w-[95px] lg:max-w-50 p-1 m-0 xl:p-2 lg:m-2 lg:px-5 lg:py-2 xl:px-10 xl:py-3 rounded-lg ${outlineStyle} transition-all duration-300 shadow-xl backdrop-blur-sm shrink-0`}
    >
      <div className="flex items-center justify-center mb-0.5 lg:mb-3 ">
        <h1
          className="w-full text-center text-[11px] lg:text-xl font-bold text-gray-800 truncate max-w-[55px] lg:max-w-none"
          title={name}
        >
          {name}
        </h1>
        {isDealer && (
          <span className="bg-amber-400 text-black px-1 lg:px-2 rounded-full text-[9px] lg:text-xs ml-1 lg:ml-2 font-semibold">
            Dealer
          </span>
        )}
        {lobbyId && isPlayer && (
          <span className="bg-green-400 text-black px-1 lg:px-2 rounded-full text-[9px] lg:text-xs ml-1 lg:ml-2 italic font-semibold">
            You
          </span>
        )}
        {player.disconnected && (
          <span className="block bg-red-500 text-white rounded-full px-1 lg:px-2 text-[9px] lg:text-xs ml-1 lg:ml-2 italic">
            DC'd
          </span>
        )}
      </div>

      <div className="flex flex-col items-center space-y-0.5 lg:space-y-2 max-w-[90px] lg:max-w-none mx-auto">
        {/* Flip-card container */}
        <div
          className={`${displayCardImage} relative self-center cursor-pointer transition-transform hover:scale-105`}
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
              className={`${cardImgClasses} absolute inset-0 hover:border-gray-400`}
              style={{ backfaceVisibility: "hidden" }}
              src={backImgSrc}
              alt=""
              draggable={false}
            />
            {/* Front face */}
            <img
              className={`${cardImgClasses} absolute inset-0 hover:border-gray-400`}
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              src={frontImgSrc}
              alt=""
              draggable={false}
            />
            <img className={`${cardImgClasses} invisible`} src={backImgSrc} alt="" />
          </motion.div>
        </div>

        <p className={`${displayCardsLeft} text-[9px] lg:text-base font-medium text-gray-700`}>Cards: {hand.length}</p>
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
    prev.dealer === next.dealer
  );
});
