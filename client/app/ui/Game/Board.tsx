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
    <div className="w-full h-full flex items-center justify-center p-2 min-h-0 min-w-0">
      {/* 
        Mobile Optimized Sizing:
        - w-[clamp(220px,min(72vw,55vh),580px)]: 
          Reduces mobile width target from 85vw -> 72vw and lowers floor to 220px.
        - gap-[clamp(3px,1cqw,10px)]: 
          Tighter 3px gap baseline for small mobile screens.
      */}
      <div
        className="
          grid grid-cols-5 
          gap-[clamp(3px,1cqw,10px)]
          @container 
          w-[clamp(220px,min(72vw,55vh),580px)] 
          aspect-[5/7] 
          items-center justify-center 
          shrink-0 
          select-none
        "
      >
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
