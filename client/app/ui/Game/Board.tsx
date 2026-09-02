import Spot from "./Spot";
import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import type { BoardType } from "@cross-cribbs/shared-types/GameControllerTypes";

type ChildProps = {
  board: BoardType;
  lastMove: BoardPosition | null;
  turn: number;
  playCard: (pos: BoardPosition, turn: number) => void;
};

export default function Board({ board, lastMove, playCard, turn }: ChildProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      {/* 
        Width and height are bounded simultaneously via min(vw, vh).
        This eliminates Safari layout engine ambiguity on initial render.
      */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 w-[min(88vw,48vh)] md:w-[min(70vw,60vh)] lg:w-[min(50vw,68vh)] aspect-[5/7] items-center justify-center shrink-0">
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
                isLastMove={isLastMove}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
