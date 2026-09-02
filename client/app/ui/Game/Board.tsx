import Spot from "./Spot";
import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import type { BoardType } from "@cross-cribbs/shared-types/GameControllerTypes";
import type { CardSizesType } from "@cross-cribbs/shared-types/CardType";

type ChildProps = {
  board: BoardType;
  lastMove: BoardPosition | null;
  turn: number;
  playCard: (pos: BoardPosition, turn: number) => void;
  cardSizes?: CardSizesType;
};

const COLS = [1, 2, 3, 4, 5];
const ROWS = [1, 2, 3, 4, 5];

function ColumnDiamond({ num }: { num: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 select-none pointer-events-none opacity-85"
      role="img"
      aria-label={`Column ${num}`}
    >
      <polygon
        points="12,2.5 21.5,12 12,21.5 2.5,12"
        fill="rgba(0, 0, 0, 0.18)"
        stroke="rgba(232, 121, 249, 0.3)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(240, 171, 252, 0.65)"
        fontSize="11.5"
        fontWeight="600"
        className="font-sans"
      >
        {num}
      </text>
    </svg>
  );
}

function RowCircle({ num }: { num: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 select-none pointer-events-none opacity-85"
      role="img"
      aria-label={`Row ${num}`}
    >
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="rgba(0, 0, 0, 0.18)"
        stroke="rgba(34, 211, 238, 0.3)"
        strokeWidth="1.25"
      />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(165, 243, 252, 0.65)"
        fontSize="11.5"
        fontWeight="600"
        className="font-sans"
      >
        {num}
      </text>
    </svg>
  );
}

export default function Board({ board, lastMove, playCard, turn }: ChildProps) {
  return (
    <div className="w-full h-full flex items-center justify-center lg:p-2 min-h-0 min-w-0">
      {/*
        3-column grid: [row-labels] [card-grid] [mirror-spacer]
        The right spacer mirrors the left row-label column width so the card
        grid stays perfectly centered despite the row labels being present.
      */}
      <div className="inline-grid grid-cols-[auto_1fr_auto] items-center justify-center select-none">
        {/* Top-Left: spacer above row labels */}
        <div aria-hidden="true" />

        {/* Top: Column axis labels (Diamonds 1-5) */}
        <div className="grid grid-cols-5 gap-[clamp(3px,1cqw,10px)] w-full mb-1 sm:mb-1.5">
          {COLS.map((col) => (
            <div key={col} className="flex items-center justify-center">
              <ColumnDiamond num={col} />
            </div>
          ))}
        </div>

        {/* Top-Right: spacer to mirror top-left */}
        <div aria-hidden="true" />

        {/* Left: Row axis labels (Circles 1-5) */}
        <div className="grid grid-rows-5 gap-[clamp(3px,1cqw,10px)] h-full mr-1 sm:mr-1.5 self-stretch items-center justify-center">
          {ROWS.map((row) => (
            <div key={row} className="flex items-center justify-center h-full">
              <RowCircle num={row} />
            </div>
          ))}
        </div>

        {/* 5x5 Card Grid */}
        <div
          className="crib-board
            grid grid-cols-5 
            gap-[clamp(3px,1cqw,10px)]
            @container 
            w-[clamp(210px,min(70vw,53vh),580px)] 
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

        {/* Right: invisible mirror of the row-label column to balance centering */}
        <div
          aria-hidden="true"
          className="grid grid-rows-5 gap-[clamp(3px,1cqw,10px)] h-full ml-1 sm:ml-1.5 self-stretch items-center justify-center"
        >
          {ROWS.map((row) => (
            <div key={row} className="flex items-center justify-center h-full">
              {/* Same size as RowCircle but invisible */}
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 invisible" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
