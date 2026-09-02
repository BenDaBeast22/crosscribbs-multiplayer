/*
- Board component:
  - Renders a 5x5 responsive grid of spots
  - Height-constrained so cards scale down naturally without growing too large
*/

import Spot from "./Spot";
import type { CardSizesType } from "@cross-cribbs/shared-types/CardType";
import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import type { BoardType } from "@cross-cribbs/shared-types/GameControllerTypes";

type ChildProps = {
  board: BoardType;
  lastMove: BoardPosition | null;
  turn: number;
  playCard: (pos: BoardPosition, turn: number) => void;
  cardSizes: CardSizesType;
};

export default function Board({ board, lastMove, playCard, turn, cardSizes }: ChildProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* 
        By anchoring to height (max-h-[55vh] / max-h-[65vh]) with aspect-[5/7], 
        the board automatically scales its width down to keep cards at a balanced size.
      */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 h-full max-h-[55vh] md:max-h-[65vh] aspect-5/7 items-center justify-center mx-auto">
        {board.map((row, r) =>
          row.map((card, c) => {
            const isLastMove = !!lastMove && lastMove[0] === r && lastMove[1] === c;
            return (
              <Spot
                pos={[r, c]}
                card={card}
                key={`${r}-${c}`}
                playCard={playCard}
                turn={turn}
                cardSizes={cardSizes}
                isLastMove={isLastMove}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
