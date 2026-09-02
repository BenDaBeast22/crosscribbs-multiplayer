import type { CardType } from "@cross-cribbs/shared-types/CardType";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import { motion } from "framer-motion";
import { getPlayer } from "~/helpers";

interface CribProps {
  crib: CardType[];
  dealer: number | null;
  players: PlayerType[];
  turn: number;
  playerId: string | undefined;
  lobbyId: string | undefined;
  numPlayers: number;
  discardToCrib: (lobbyId: string | undefined, numPlayers: number) => void;
}

// Player hand cards are shown smaller than board cards — multiplier is relative
// to the board's own per-card height (boardMaxHeight / 5 rows): 11vh mobile, 13vh md/lg
const PLAYER_CARD_SCALE = {
  base: 0.55, // mobile
  md: 0.55,
  lg: 0.55,
  xl: 0.65,
  xxl: 0.8,
};

export default function Crib({ crib, dealer, players, turn, playerId, lobbyId, numPlayers, discardToCrib }: CribProps) {
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
  const cardImgClasses = `h-[calc(11vh*${PLAYER_CARD_SCALE.base})] md:h-[calc(13vh*${PLAYER_CARD_SCALE.md})] lg:h-[calc(13vh*${PLAYER_CARD_SCALE.lg})] xl:h-[calc(13vh*${PLAYER_CARD_SCALE.xl})] 2xl:h-[calc(13vh*${PLAYER_CARD_SCALE.xxl})] aspect-[2.5/3.5] rounded-md shadow-lg object-contain`;

  return (
    <div className="lg:w-full bg-game-panel p-2 md:p-4 rounded-lg shadow-lg">
      <h3 className="text-white text-center font-bold text-xs md:text-lg mb-1.5">Crib: {dealerTeam}</h3>
      <div className="flex flex-col space-x-1.5 items-center">
        <div className="flex space-x-1 md:space-x-2">
          {Array.from({ length: MAX_CARDS }).map((_, i) => {
            const card = crib[i]; // get the card if it exists
            return (
              <motion.img
                key={i}
                className={cardImgClasses}
                src={backImgSrc}
                alt=""
                initial={false}
                animate={
                  card ? { opacity: 1, scale: 1, y: 0, rotate: 0 } : { opacity: 0, scale: 0.4, y: -24, rotate: -8 }
                }
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                style={{ pointerEvents: card ? "auto" : "none" }}
              />
            );
          })}
        </div>
        <button
          onClick={handleDiscard}
          className={`${displayDiscardButtonClass} bg-red-500 hover:bg-red-700 text-white font-bold text-[10px] py-0.5 px-1.5 lg:p-2 mt-3 rounded lg:text-sm cursor-pointer whitespace-nowrap`}
        >
          Discard To Crib
        </button>
      </div>
    </div>
  );
}
