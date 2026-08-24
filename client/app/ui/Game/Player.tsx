import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import type { CardSizesType, CardType } from "@cross-cribbs/shared-types/CardType";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import { socket } from "~/connections/socket";

type ChildProps = {
  name: string;
  player: PlayerType;
  turn: number;
  crib: CardType[];
  numPlayers: number;
  lobbyId: string | undefined;
  playerId: string | undefined;
  cardSizes: CardSizesType;
};

function PlayerComponent({ name, player, turn, lobbyId, numPlayers, playerId, cardSizes }: ChildProps) {
  const { hand, discardedToCrib } = player;
  const localPlayerId = localStorage.getItem("playerId");

  const card = hand.length > 0 ? hand[hand.length - 1] : null;
  const backImgSrc = `/cards/backs/red2.svg`;

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLImageElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/player", JSON.stringify(player));
    },
    [player],
  );

  const handleDiscard = useCallback(() => {
    if (card) {
      socket.emit("discardToCrib", { lobbyId, numPlayers, player, playerId, localPlayerId, card });
    }
  }, [card, player, playerId, lobbyId, numPlayers]);

  const isMultiplayer = !!lobbyId;
  const isTurn = player.num === turn;
  const isPlayer = playerId === player.id;
  const isDraggable = isTurn && (!lobbyId || isPlayer);

  const outlineStyle = useMemo(() => {
    const color = player.num % 2 === 0 ? "outline-fuchsia-400" : "outline-cyan-400";
    return isTurn ? `outline-2 lg:outline-6 ${color}` : "outline-[1px] lg:outline-2 outline-stone-300";
  }, [player.num, isTurn]);

  const bgGradient = useMemo(() => "bg-gradient-to-br from-slate-100 to-slate-200", []);

  // NEW — whether the card's FACE should be showing right now
  const showFront = isMultiplayer ? isPlayer && !!card : isTurn && !!card;
  const frontImgSrc = card ? card.frontImgSrc : backImgSrc;

  const displayDiscardButton = () => {
    if (isMultiplayer) {
      return isPlayer && isTurn && (numPlayers === 2 ? discardedToCrib.length < 2 : discardedToCrib.length < 1);
    }
    return isTurn && (numPlayers === 2 ? discardedToCrib.length < 2 : discardedToCrib.length < 1);
  };

  const displayDiscardButtonClass = displayDiscardButton() ? "" : "invisible";
  const displayCardsLeft = card ? "" : "invisible";
  const displayCardImage = card ? "" : "invisible";

  const cardImgClasses = `${cardSizes.base} ${cardSizes.sm} ${cardSizes.md} ${cardSizes.xl} border-transparent border-[0.5px] lg:border-2 rounded-lg shadow-lg`;

  return (
    <div
      className={`flex flex-col justify-center ${bgGradient} max-w-[130px] lg:max-w-50 p-1 m-0 lg:p-2 lg:m-2 lg:px-10 lg:py-3 rounded-lg ${outlineStyle} transition-all duration-300 shadow-xl backdrop-blur-sm`}
    >
      <div className="flex items-center justify-center mb-0.5 lg:mb-3">
        {/* Responsive text sizes: text-sm on mobile, lg:text-xl on desktop */}
        <h1
          className="w-full text-center text-xs lg:text-xl font-bold text-gray-800 truncate max-w-[65px] lg:max-w-none"
          title={name}
        >
          {name}
        </h1>
        {lobbyId && isPlayer && (
          <span className="bg-green-400 text-black px-1 lg:px-2 rounded-full text-[10px] lg:text-xs ml-1 lg:ml-2 italic">
            You
          </span>
        )}
        {player.disconnected && (
          <span className="block bg-red-500 text-black rounded-full px-1 lg:px-2 text-[10px] lg:text-xs ml-1 lg:ml-2 italic">
            DC'd
          </span>
        )}
      </div>

      {/* Adjusted mobile max-width bounds from max-w-16 up to max-w-[100px] so the card sizes object doesn't get crushed */}
      <div className="flex flex-col items-center space-y-0.5 lg:space-y-2 max-w-[100px] lg:max-w-none mx-auto">
        {/* Flip-card container */}
        <div
          className={`${displayCardImage} relative self-center cursor-pointer transition-transform hover:scale-105`}
          style={{ perspective: 1000 }}
          draggable={isDraggable} // moved here
          onDragStart={handleDragStart} // moved here
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

        {/* Scaled text font metrics down to text-[10px] for tight viewports */}
        <p className={`${displayCardsLeft} text-[10px] lg:text-base font-medium text-gray-700`}>Cards: {hand.length}</p>

        <button
          onClick={handleDiscard}
          className={`${displayDiscardButtonClass} bg-red-500 hover:bg-red-700 text-white font-bold text-[10px] py-0.5 px-1.5 lg:p-2 rounded lg:text-sm cursor-pointer whitespace-nowrap`}
        >
          Discard
        </button>
      </div>
    </div>
  );
}

export default React.memo(PlayerComponent, (prev, next) => {
  return (
    prev.player.hand === next.player.hand &&
    prev.turn === next.turn &&
    prev.player.num === next.player.num &&
    prev.crib === next.crib
  );
});
