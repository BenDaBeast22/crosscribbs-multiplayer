import type { RoundHistoryType } from "@cross-cribbs/shared-types/GameControllerTypes";

type ChildProps = {
  roundHistory: RoundHistoryType[];
};

export default function RoundHistory({ roundHistory }: ChildProps) {
  let rowTotal = 0;
  let columnTotal = 0;
  const chronologicalTotals = roundHistory.map((round) => {
    // Before: `else` lumped "Column" and "Tie" together (harmless since
    // pointDiff is 0 on a tie, but wrong logic — a tie should add to neither)
    if (round.winner === "Row") {
      rowTotal += round.pointDiff;
    } else if (round.winner === "Column") {
      columnTotal += round.pointDiff;
    }
    // Tie: neither total changes
    return { rowTotal, columnTotal };
  });

  const reversedHistory = [...roundHistory].reverse();
  const reversedTotals = [...chronologicalTotals].reverse();

  return (
    <div className="hidden md:block bg-game-panel w-full text-white p-4 rounded-lg shadow-lg max-h-112.5 min-h-75 xl:min-h-100 xl:max-h-120 2xl:min-h-112.5 2xl:max-h-125 overflow-y-auto">
      <h3 className="text-lg font-bold mb-3 text-center">Round History</h3>
      <div className="space-y-3">
        {reversedHistory.map((round, index) => (
          <div key={round.round} className="text-sm border-b border-slate-500 pb-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Round {round.round}</span>
              <span
                className={`font-bold ${
                  round.winner === "Row"
                    ? "text-cyan-400"
                    : round.winner === "Column"
                      ? "text-fuchsia-400"
                      : "text-white/50"
                }`}
              >
                {round.winner === "Tie" ? "Tie" : `${round.winner} +${round.pointDiff}`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-300 mt-1">
              <span>Row: {round.rowScore}</span>
              <span>Column: {round.columnScore}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-cyan-400">Total: {reversedTotals[index].rowTotal}</span>
              <span className="text-fuchsia-400">Total: {reversedTotals[index].columnTotal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}