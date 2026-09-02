import type { CardSizesType, CardType } from "@cross-cribbs/shared-types/CardType";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import { motion } from "framer-motion";
import { getPlayer } from "~/helpers";

interface CribProps {
  crib: CardType[];
  dealer: number | null;
  cardSizes: CardSizesType;
  players: PlayerType[];
  turn: number;
  playerId: string | undefined;
  lobbyId: string | undefined;
  numPlayers: number;
  discardToCrib: (lobbyId: string | undefined, numPlayers: number) => void;
}

export default function Crib({
  crib,
  dealer,
  cardSizes,
  players,
  turn,
  playerId,
  lobbyId,
  numPlayers,
  discardToCrib,
}: CribProps) {
  const backImgSrc = `/cards/backs/red2.svg`;
  const dealerTeam = dealer ? (dealer % 2 !== 0 ? "Row" : "Column") : "";
  const MAX_CARDS = 4;
  const isMultiplayer = !!lobbyId;
  const player = getPlayer(players, turn);
  const isPlayer = playerId === player.id;
  const isTurn = player.num === turn;

  const { hand, discardedToCrib } = player;
  const card = hand.length > 0 ? hand[hand.length - 1] : null;

  const handleDiscard = () => {
    if (card) {
      discardToCrib(lobbyId, numPlayers);
    }
  };

  const displayDiscardButton = () => {
    if (isMultiplayer) {
      return isPlayer && isTurn && (numPlayers === 2 ? discardedToCrib.length < 2 : discardedToCrib.length < 1);
    }
    return isTurn && (numPlayers === 2 ? discardedToCrib.length < 2 : discardedToCrib.length < 1);
  };

  const displayDiscardButtonClass = displayDiscardButton() ? "" : "invisible";

  return (
    <div className="bg-game-panel px-2 py-1.5 md:p-3 lg:p-4 rounded-lg shadow-lg flex flex-col items-center shrink-0 max-w-full">
      <h3 className="text-white text-center font-bold text-[11px] md:text-sm lg:text-lg mb-0.5 md:mb-1">
        Crib: {dealerTeam}
      </h3>

      <div className="flex flex-col items-center gap-1 w-full">
        <div className="flex justify-center gap-1 md:gap-2">
          {Array.from({ length: MAX_CARDS }).map((_, i) => {
            const card = crib[i];
            return (
              <motion.img
                key={i}
                /* Sized smaller on base mobile screens (36px x 50px) to guarantee vertical fit */
                className={`w-[36px] h-[50.4px] ${cardSizes.sm} ${cardSizes.md} ${cardSizes.xl} rounded shadow-md shrink-0`}
                src={backImgSrc}
                alt=""
                initial={false}
                animate={
                  card ? { opacity: 1, scale: 1, y: 0, rotate: 0 } : { opacity: 0, scale: 0.4, y: -16, rotate: -8 }
                }
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                style={{ pointerEvents: card ? "auto" : "none" }}
              />
            );
          })}
        </div>

        <button
          onClick={handleDiscard}
          className={`${displayDiscardButtonClass} bg-red-500 hover:bg-red-700 text-white font-bold text-[10px] md:text-xs lg:text-sm  px-2 md:py-1 md:px-3 mt-0.5 rounded cursor-pointer whitespace-nowrap transition-colors`}
        >
          Discard To Crib
        </button>
      </div>
    </div>
  );
}
