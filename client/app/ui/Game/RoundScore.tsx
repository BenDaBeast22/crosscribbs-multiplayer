import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BoardType } from "@cross-cribbs/shared-types/GameControllerTypes";
import type { CardSizesType, CardType } from "@cross-cribbs/shared-types/CardType";
import type { ScoreType } from "@cross-cribbs/shared-types/ScoreType";

type ChildProps = {
  nextRound: () => void;
  roundScores: any;
  lineScores: [ScoreType[], ScoreType[]] | null;
  totalScores: any;
  cribScore: any;
  dealer: number | null;
  crib: CardType[];
  board: BoardType;
  heels: number;
  cardSizes: CardSizesType;
};

const LINE_REVEAL_DELAY_MS = 900;
const RACE_DURATION_MS = 1400;
const RACE_TICKS = 28;

function describeLine(line: ScoreType): string {
  const parts: string[] = [];
  if (line.pairs) parts.push(`pairs: ${line.pairs}pt${line.pairs !== 1 ? "s" : ""}`);
  if (line.runs) parts.push(`runs: ${line.runs}pts`);
  if (line.fifteens) parts.push(`fifteens: ${line.fifteens}pts`);
  if (line.flushes) parts.push(`flush: ${line.flushes}pts`);
  if (line.knobs) parts.push(`knobs: ${line.knobs}pt`);
  return parts.length ? parts.join(" · ") : "no points";
}

export default function RoundScore({
  nextRound,
  roundScores,
  lineScores,
  totalScores,
  cribScore,
  dealer,
  crib,
  board,
  heels,
  cardSizes,
}: ChildProps) {
  const rowLines = lineScores?.[0] ?? [];
  const colLines = lineScores?.[1] ?? [];
  const hasLineBreakdown = rowLines.length === 5 && colLines.length === 5;

  const rowTeamRoundScore = roundScores[0].total; // includes crib + heels, added server-side
  const colTeamRoundScore = roundScores[1].total;
  const pointDiff = Math.abs(rowTeamRoundScore - colTeamRoundScore);
  const winner = rowTeamRoundScore >= colTeamRoundScore ? "Row" : "Column";

  const [revealedLines, setRevealedLines] = useState(hasLineBreakdown ? 0 : 5);
  const [showBonus, setShowBonus] = useState(!hasLineBreakdown);
  const [raceStarted, setRaceStarted] = useState(!hasLineBreakdown);
  const [raceDone, setRaceDone] = useState(!hasLineBreakdown);
  const [showFinal, setShowFinal] = useState(!hasLineBreakdown);
  const [peek, setPeek] = useState(false);

  const [raceRow, setRaceRow] = useState(hasLineBreakdown ? rowTeamRoundScore : 0);
  const [raceCol, setRaceCol] = useState(hasLineBreakdown ? colTeamRoundScore : 0);

  // Stage progression: lines -> bonus -> (race triggers separately) -> final
  useEffect(() => {
    if (!hasLineBreakdown) return;
    if (revealedLines < 5) {
      const t = setTimeout(() => setRevealedLines((n) => n + 1), LINE_REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    } else if (!showBonus) {
      const t = setTimeout(() => setShowBonus(true), LINE_REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    } else if (!raceStarted) {
      const t = setTimeout(() => setRaceStarted(true), LINE_REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    } else if (raceDone && !showFinal) {
      const t = setTimeout(() => setShowFinal(true), LINE_REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [revealedLines, showBonus, raceStarted, raceDone, showFinal, hasLineBreakdown]);

  // The subtract-race: both counters tick down together; the smaller hits exactly 0
  // at the last tick, and the remaining value on the other side IS the point diff.
  useEffect(() => {
    if (!raceStarted || raceDone || !hasLineBreakdown) return;
    const tickMs = RACE_DURATION_MS / RACE_TICKS;
    const minVal = Math.min(rowTeamRoundScore, colTeamRoundScore);
    const stepPerTick = minVal / RACE_TICKS;

    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      if (tick >= RACE_TICKS) {
        setRaceRow(Math.max(0, Math.round(rowTeamRoundScore - minVal)));
        setRaceCol(Math.max(0, Math.round(colTeamRoundScore - minVal)));
        clearInterval(interval);
        setRaceDone(true);
        return;
      }
      setRaceRow(Math.max(0, rowTeamRoundScore - stepPerTick * tick));
      setRaceCol(Math.max(0, colTeamRoundScore - stepPerTick * tick));
    }, tickMs);

    return () => clearInterval(interval);
  }, [raceStarted, raceDone, hasLineBreakdown, rowTeamRoundScore, colTeamRoundScore]);

  function skipAnimation() {
    setRevealedLines(5);
    setShowBonus(true);
    setRaceStarted(true);
    setRaceDone(true);
    setRaceRow(winner === "Row" ? pointDiff : 0);
    setRaceCol(winner === "Column" ? pointDiff : 0);
    setShowFinal(true);
  }

  const dealerTeam = dealer ? (dealer % 2 !== 0 ? "Row" : "Column") : "";
  const cutCard = board[2][2];
  const cribHand = cutCard ? [...crib, cutCard] : crib;
  const cribPoints = cribScore ? cribScore.total : 0;

  const rowRunningTotal = rowLines.slice(0, revealedLines).reduce((sum, l) => sum + l.total, 0);
  const colRunningTotal = colLines.slice(0, revealedLines).reduce((sum, l) => sum + l.total, 0);

  const peekHandlers = {
    onMouseEnter: () => setPeek(true),
    onMouseLeave: () => setPeek(false),
    onMouseDown: () => setPeek(true),
    onMouseUp: () => setPeek(false),
    onTouchStart: () => setPeek(true),
    onTouchEnd: () => setPeek(false),
  };

  return (
    <div
      className={`absolute inset-0 mx-auto my-auto w-[320px] h-[600px] md:w-[600px] md:h-[700px] lg:w-[650px] lg:h-[750px] p-5 bg-game-panel text-white rounded-lg border-2 border-solid border-slate-800
      transition-opacity ease-in duration-200 text-sm md:text-base overflow-y-auto ${
        peek ? "opacity-15" : "opacity-95"
      }`}
    >
      <div className="relative flex items-center justify-center mb-3">
        <h2 className="text-lg md:text-3xl text-white text-center">Round Summary</h2>
        {!showFinal && (
          <button onClick={skipAnimation} className="absolute left-0 text-xs md:text-sm underline text-white/60 hover:text-white">
            Skip
          </button>
        )}
        <button
          {...peekHandlers}
          className="absolute right-0 text-xs md:text-sm px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/80"
          aria-label="Hold to peek at the board"
        >
          👁 Peek
        </button>
      </div>

      {/* Line-by-line reveal */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <h3 className="font-bold md:text-xl text-cyan-400 text-center mb-2">Row</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {rowLines.slice(0, revealedLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs md:text-sm bg-black/20 rounded px-2 py-1.5"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-white">Row {i + 1}</span>
                    <span className="font-bold text-cyan-300">+{line.total}</span>
                  </div>
                  <div className="text-white/50 text-[11px] mt-1 pl-2 border-l-2 border-cyan-400/30">
                    {describeLine(line)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-right mt-1 font-bold text-cyan-300">Running: {rowRunningTotal}</p>
        </div>

        <div>
          <h3 className="font-bold md:text-xl text-fuchsia-400 text-center mb-2">Column</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {colLines.slice(0, revealedLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs md:text-sm bg-black/20 rounded px-2 py-1.5"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-white">Col {i + 1}</span>
                    <span className="font-bold text-fuchsia-300">+{line.total}</span>
                  </div>
                  <div className="text-white/50 text-[11px] mt-1 pl-2 border-l-2 border-fuchsia-400/30">
                    {describeLine(line)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-right mt-1 font-bold text-fuchsia-300">Running: {colRunningTotal}</p>
        </div>
      </div>

      {/* Crib box + bonus text + round totals */}
      <AnimatePresence>
        {showBonus && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            {cribScore && (
              <div className="w-full flex justify-center mb-2 text-center">
                <div className="bg-game-panel rounded-lg p-2 border border-white/10">
                  <h3 className="font-bold md:text-xl text-white">Crib ({dealerTeam})</h3>
                  <div className="flex justify-center space-x-1 my-2">
                    {cribHand.map((card, i) => (
                      <img
                        key={i}
                        src={`/cards/fronts/${card.suit}_${card.name}.svg`}
                        alt={`${card.name} of ${card.suit}`}
                        className={`${cardSizes.base} ${cardSizes.md} ${cardSizes.xl}`}
                      />
                    ))}
                  </div>
                  <p className="md:text-xl font-bold text-white">{cribScore.total} points</p>
                  <div className="flex justify-around mt-2 text-xs md:text-sm gap-2">
                    <p>pairs: {cribScore.pairs}pts</p>
                    <p>runs: {cribScore.runs}pts</p>
                    <p>fifteens: {cribScore.fifteens}pts</p>
                    <p>flushes: {cribScore.flushes}pts</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-0.5 mb-3">
              {cribScore && <p className="text-orange-400 text-sm">{dealerTeam} crib: +{cribPoints}</p>}
              {heels > 0 && <p className="text-orange-400 text-sm">{dealerTeam} His Heels: +{heels}</p>}
            </div>

            {/* NEW — full round totals (line points + crib + heels combined) */}
            <div className="flex justify-around mb-3 text-center">
              <div>
                <p className="text-cyan-400 font-bold text-xs md:text-sm">Row Total</p>
                <p className="text-xl md:text-2xl font-bold text-cyan-300">{rowTeamRoundScore}</p>
              </div>
              <div>
                <p className="text-fuchsia-400 font-bold text-xs md:text-sm">Column Total</p>
                <p className="text-xl md:text-2xl font-bold text-fuchsia-300">{colTeamRoundScore}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW — subtract race: both totals count down together until the loser hits 0 */}
      <AnimatePresence>
        {raceStarted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
            <div className="flex justify-around items-center">
              <motion.p
                key={Math.round(raceRow)}
                className="text-2xl md:text-4xl font-bold text-cyan-300 tabular-nums"
              >
                {Math.round(raceRow)}
              </motion.p>
              <span className="text-white/40 text-lg">vs</span>
              <motion.p
                key={Math.round(raceCol)}
                className="text-2xl md:text-4xl font-bold text-fuchsia-300 tabular-nums"
              >
                {Math.round(raceCol)}
              </motion.p>
            </div>

            {raceDone && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-semibold md:text-lg bg-emerald-600 rounded-md italic w-fit px-4 mx-auto mt-3 text-center"
              >
                {winner} earns {pointDiff} points!
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total game scores + next round */}
      <AnimatePresence>
        {showFinal && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-game-panel rounded-lg p-2 border border-white/10">
              <h3 className="text-center md:text-lg text-white">Total Scores</h3>
              <div className="flex justify-around mt-1">
                <div className="text-center">
                  <p className="text-cyan-400 font-bold">Row</p>
                  <p className="md:text-xl text-white">{totalScores[0]}</p>
                </div>
                <div className="text-center">
                  <p className="text-fuchsia-400 font-bold">Column</p>
                  <p className="md:text-xl text-white">{totalScores[1]}</p>
                </div>
              </div>
            </div>

            <button
              className="w-full bg-blue-500 text-white font-bold rounded-xl md:text-xl border-white border-2 hover:bg-blue-600 py-2 mt-2 transition-colors duration-300 cursor-pointer"
              onClick={nextRound}
            >
              Next Round
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}