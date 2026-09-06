import Spot from "./Spot";
import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import type { BoardType } from "@cross-cribbs/shared-types/GameControllerTypes";
import type { CardSizesType } from "@cross-cribbs/shared-types/CardType";
import type { ScoreType } from "@cross-cribbs/shared-types/ScoreType";
import { useMemo } from "react";
import { calculateLiveScores, describeLineScore } from "~/utils/scoring";

type ChildProps = {
  board: BoardType;
  lastMove: BoardPosition | null;
  lastMovePlayerNum: number | null;
  turn: number;
  playCard: (pos: BoardPosition, turn: number) => void;
  cardSizes?: CardSizesType;
  showLiveScoring?: boolean;
  toggleLiveScoring?: () => void;
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
      <circle cx="12" cy="12" r="9.5" fill="rgba(0, 0, 0, 0.18)" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.25" />
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

function RowScoreBadge({ score, rowNum, isVisible }: { score?: ScoreType; rowNum: number; isVisible: boolean }) {
  if (!isVisible || !score) {
    return <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 invisible" />;
  }

  const hasPoints = score.total > 0;
  return (
    <div
      className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-[3px] flex items-center justify-center font-sans text-[11px] sm:text-xs md:text-sm select-none transition-colors duration-150 cursor-help ${
        hasPoints
          ? "bg-[rgba(8,35,45,0.45)] border border-cyan-400/40 text-cyan-200/90 font-semibold"
          : "bg-black/20 border border-cyan-500/15 text-cyan-400/30 font-normal"
      }`}
      title={`Row ${rowNum}: ${score.total} pts (${describeLineScore(score)})`}
    >
      {score.total}
    </div>
  );
}

function ColScoreBadge({ score, colNum, isVisible }: { score?: ScoreType; colNum: number; isVisible: boolean }) {
  if (!isVisible || !score) {
    return <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 invisible" />;
  }

  const hasPoints = score.total > 0;
  return (
    <div
      className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-[3px] flex items-center justify-center font-sans text-[11px] sm:text-xs md:text-sm select-none transition-colors duration-150 cursor-help ${
        hasPoints
          ? "bg-[rgba(45,10,38,0.45)] border border-fuchsia-400/40 text-fuchsia-200/90 font-semibold"
          : "bg-black/20 border border-fuchsia-500/15 text-fuchsia-400/30 font-normal"
      }`}
      title={`Column ${colNum}: ${score.total} pts (${describeLineScore(score)})`}
    >
      {score.total}
    </div>
  );
}

export default function Board({
  board,
  lastMove,
  lastMovePlayerNum,
  playCard,
  turn,
  showLiveScoring = false,
  toggleLiveScoring,
}: ChildProps) {
  const { rowScores, colScores } = useMemo(() => calculateLiveScores(board), [board]);

  return (
    <div className="w-full h-full flex items-center justify-center lg:p-2 min-h-0 min-w-0">
      {/*
        3-column, 3-row grid:
        Row 1: [spacer]        [col-diamonds] [toggle-button]
        Row 2: [row-circles]   [card-grid]    [row-live-scores]
        Row 3: [spacer]        [col-live-scores] [spacer]
        Opposite axis labels: Row scores on the right, Column scores on the bottom.
      */}
      <div className="inline-grid grid-cols-[auto_1fr_auto] items-center justify-center select-none">
        {/* Top-Left: spacer above row labels */}
        <div aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 invisible" />

        {/* Top: Column axis labels (Diamonds 1-5) */}
        <div className="grid grid-cols-5 gap-[clamp(3px,1cqw,10px)] w-full mb-1 sm:mb-1.5">
          {COLS.map((col) => (
            <div key={col} className="flex items-center justify-center">
              <ColumnDiamond num={col} />
            </div>
          ))}
        </div>

        {/* Top-Right: live scoring toggle button (or spacer) */}
        <div className="flex items-center justify-center">
          {toggleLiveScoring ? (
            <button
              onClick={toggleLiveScoring}
              className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-[3px] flex items-center justify-center transition-colors duration-150 cursor-pointer ${
                showLiveScoring
                  ? "bg-[rgba(8,35,45,0.45)] border border-cyan-400/40 text-cyan-300/80 hover:border-cyan-400/70"
                  : "bg-black/20 border border-slate-700/40 text-slate-500 hover:text-slate-400 hover:border-slate-600/50"
              }`}
              title={`Live Scoring: ${showLiveScoring ? "ON" : "OFF"} (Click to toggle)`}
              aria-label="Toggle Live Scoring"
            >
              <span className="text-[10px] sm:text-xs font-semibold">#</span>
            </button>
          ) : (
            <div aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 invisible" />
          )}
        </div>

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
                  lastMovePlayerNum={lastMovePlayerNum}
                />
              );
            }),
          )}
        </div>

        {/* Right: Row live scores (opposite of Row circles on left) */}
        <div className="grid grid-rows-5 gap-[clamp(3px,1cqw,10px)] h-full ml-1 sm:ml-1.5 self-stretch items-center justify-center">
          {ROWS.map((row, idx) => (
            <div key={row} className="flex items-center justify-center h-full">
              <RowScoreBadge score={rowScores[idx]} rowNum={row} isVisible={showLiveScoring} />
            </div>
          ))}
        </div>

        {/* Bottom-Left: spacer below row labels */}
        <div aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 invisible" />

        {/* Bottom: Column live scores (opposite of Column diamonds on top) */}
        <div className="grid grid-cols-5 gap-[clamp(3px,1cqw,10px)] w-full mt-1 sm:mt-1.5">
          {COLS.map((col, idx) => (
            <div key={col} className="flex items-center justify-center">
              <ColScoreBadge score={colScores[idx]} colNum={col} isVisible={showLiveScoring} />
            </div>
          ))}
        </div>

        {/* Bottom-Right: spacer below row scores */}
        <div aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 invisible" />
      </div>
    </div>
  );
}
