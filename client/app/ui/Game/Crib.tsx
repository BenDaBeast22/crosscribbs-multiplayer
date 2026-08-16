import type { CardSizesType, CardType } from "@cross-cribbs/shared-types/CardType";
import { motion } from "framer-motion";

interface CribProps {
  crib: CardType[];
  dealer: number | null;
  cardSizes: CardSizesType;
}

export default function Crib({ crib, dealer, cardSizes }: CribProps) {
  const backImgSrc = `/cards/backs/red2.svg`;
  const dealerTeam = dealer ? (dealer % 2 !== 0 ? "Row" : "Column") : "";
  const MAX_CARDS = 4;

  return (
    <div className="bg-game-panel p-3 m:p-4 rounded-lg shadow-lg">
      <h3 className="text-white text-center font-bold text-sm md:text-lg mb-3">Crib: {dealerTeam}</h3>
      <div className="flex space-x-3">
        <div className="flex space-x-2">
          {Array.from({ length: MAX_CARDS }).map((_, i) => {
            const card = crib[i]; // get the card if it exists
            return (
              <motion.img
                key={i} // stable per-slot key, never changes — safe to animate
                className={`${cardSizes.base} ${cardSizes.sm} ${cardSizes.md} ${cardSizes.xl} rounded-md shadow-lg`}
                src={backImgSrc}
                alt=""
                initial={false}
                animate={
                  card
                    ? { opacity: 1, scale: 1, y: 0, rotate: 0 }
                    : { opacity: 0, scale: 0.4, y: -24, rotate: -8 }
                }
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                style={{ pointerEvents: card ? "auto" : "none" }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}