import React, { useMemo, useCallback } from "react";
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

  // for local should use playerId to get game
  const localPlayerId = localStorage.getItem("playerId");

  // Top card
  const card = hand.length > 0 ? hand[hand.length - 1] : null;
  const backImgSrc = `/cards/backs/red2.svg`;

  // Drag start handler
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLImageElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/player", JSON.stringify(player));
    },
    [player],
  );

  // Discard handler
  const handleDiscard = useCallback(() => {
    if (card) {
      socket.emit("discardToCrib", { lobbyId, numPlayers, player, playerId, localPlayerId, card });
    }
  }, [card, player, playerId, lobbyId, numPlayers]);

  // Derived states
  const isMultiplayer = !!lobbyId;
  const isTurn = player.num === turn;
  const isPlayer = playerId === player.id;
  const isDraggable = isTurn && (!lobbyId || isPlayer);

  const outlineStyle = useMemo(() => {
    const color = player.num % 2 === 0 ? "outline-fuchsia-400" : "outline-cyan-400";
    return isTurn ? `outline-3 md:outline-6 ${color}` : "outline-2 outline-stone-300";
  }, [player.num, isTurn]);

  const bgGradient = useMemo(() => "bg-gradient-to-br from-slate-100 to-slate-200", []);

  const getCardImgSrc = () => {
    if (isMultiplayer) {
      return isPlayer && card ? card.frontImgSrc : backImgSrc;
    }
    return isTurn && card ? card.frontImgSrc : backImgSrc;
  };

  // const cardImgSrc = isTurn && card ? card.frontImgSrc : backImgSrc;
  const displayDiscardButton = isTurn && (numPlayers === 2 ? discardedToCrib.length < 2 : discardedToCrib.length < 1);
  const displayDiscardButtonClass = displayDiscardButton ? "" : "invisible";
  const displayCardsLeft = card ? "" : "invisible";
  const displayCardImage = card ? "" : "invisible";

  return (
    <div
      className={`flex flex-col justify-center ${bgGradient} max-w-50 p-2 md:m-2 md:px-10 md:py-3 rounded-lg ${outlineStyle} transition-all duration-300 shadow-xl backdrop-blur-sm`}
    >
      <div className="flex items-center justify-center mb-1 md:mb-3">
        <h1 className="md:text-xl font-bold text-gray-800">{name}</h1>
        {lobbyId && isPlayer && (
          <span className="bg-green-400 text-black px-2 rounded-full text-xs ml-2 italic">You</span>
        )}
        {player.disconnected && (
          <span className="block bg-red-500 text-black rounded-full px-2 text-xs ml-2 italic">DC'd</span>
        )}
      </div>

      <div className="flex flex-col items-center space-y-0.5 md:space-y-2 max-w-16 md:max-w-none">
        <img
          className={`${displayCardImage} ${cardSizes.base} ${cardSizes.md} ${cardSizes.xl} self-center hover:border-gray-400 border-transparent border-[0.5px] md:border-2 cursor-pointer rounded-lg shadow-lg transition-transform hover:scale-105`}
          src={getCardImgSrc()}
          alt=""
          draggable={isDraggable}
          onDragStart={handleDragStart}
        />
        <p className={`${displayCardsLeft} text-xs md:text-base font-medium text-gray-700`}>Cards: {hand.length}</p>

        <button
          onClick={handleDiscard}
          className={`${displayDiscardButtonClass} bg-red-500 hover:bg-red-700 text-white font-bold py-0.5 px-2 md:p-2 rounded md:text-sm cursor-pointer`}
        >
          Discard to Crib
        </button>
      </div>
    </div>
  );
}

// Memoize Player to prevent rerenders when unrelated props change
export default React.memo(PlayerComponent, (prev, next) => {
  return (
    prev.player.hand === next.player.hand &&
    prev.turn === next.turn &&
    prev.player.num === next.player.num &&
    prev.crib === next.crib
  );
});
