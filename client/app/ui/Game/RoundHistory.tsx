import type { RoundHistoryType } from "@cross-cribbs/shared-types/GameControllerTypes";

type ChildProps = {
  roundHistory: RoundHistoryType[];
  hideLatest?: boolean;
};

export default function RoundHistory({ roundHistory, hideLatest = false }: ChildProps) {
  // Compute totals against the FULL history first, so numbers stay correct
  // once the hidden round reappears next round.
  let rowTotal = 0;
  let columnTotal = 0;
  const chronologicalTotals = roundHistory.map((round) => {
    if (round.winner === "Row") {
      rowTotal += round.pointDiff;
    } else if (round.winner === "Column") {
      columnTotal += round.pointDiff;
    }
    return { rowTotal, columnTotal };
  });

  // Drop the newest entry from display if hideLatest is true
  const visibleHistory = hideLatest ? roundHistory.slice(0, -1) : roundHistory;
  const visibleTotals = hideLatest ? chronologicalTotals.slice(0, -1) : chronologicalTotals;

  const reversedHistory = [...visibleHistory].reverse();
  const reversedTotals = [...visibleTotals].reverse();
  const roundHistoryContainerStyles =
    "bg-game-panel w-full p-4 rounded-lg text-white min-h-87 max-h-87 2xl:min-h-112.5 2xl:max-h-125 overflow-y-auto space-y-2.5";

  if (reversedHistory.length === 0) {
    return (
      <div className={roundHistoryContainerStyles}>
        <h3 className="text-lg font-bold mb-3 text-center hidden sm:block">Round History</h3>
        <div className="w-full text-center py-8 text-slate-400 text-sm italic">No rounds played yet.</div>
      </div>
    );
  }

  return (
    <div className={roundHistoryContainerStyles}>
      <h3 className="text-lg font-bold mb-3 text-center hidden sm:block">Round History</h3>
      {reversedHistory.map((round, index) => {
        const currentTotals = reversedTotals[index];

        return (
          <div
            key={round.round}
            className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 shadow-sm hover:border-slate-600 transition-colors"
          >
            {/* Header: Round Number & Winner Badge */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">Round {round.round}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  round.winner === "Row"
                    ? "bg-cyan-950/50 text-cyan-400 border-cyan-800/60"
                    : round.winner === "Column"
                      ? "bg-fuchsia-950/50 text-fuchsia-400 border-fuchsia-800/60"
                      : "bg-slate-700/40 text-slate-300 border-slate-600/50"
                }`}
              >
                {round.winner === "Tie" ? "Tie" : `${round.winner} +${round.pointDiff}`}
              </span>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-700/40">
              {/* Row Stats */}
              <div className="flex flex-col space-y-0.5">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Row Score:</span>
                  <span className="font-medium">{round.rowScore}</span>
                </div>
                <div className="flex justify-between text-cyan-400 font-semibold">
                  <span>Row Total:</span>
                  <span>{currentTotals.rowTotal}</span>
                </div>
              </div>

              {/* Column Stats */}
              <div className="flex flex-col space-y-0.5 border-l border-slate-700/40 pl-2">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Col Score:</span>
                  <span className="font-medium">{round.columnScore}</span>
                </div>
                <div className="flex justify-between text-fuchsia-400 font-semibold">
                  <span>Col Total:</span>
                  <span>{currentTotals.columnTotal}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
