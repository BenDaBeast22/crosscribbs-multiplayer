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
  isFinalRound?: boolean;
};

const LINE_REVEAL_DELAY_MS = 700;
const RACE_DURATION_MS = 1400;
const RACE_TICKS = 28;

function describeLine(line: ScoreType): string {
  const parts: string[] = [];
  if (line.pairs) parts.push(`pairs: ${line.pairs}pt${line.pairs !== 1 ? "s" : ""}`);
  if (line.runs) parts.push(`runs: ${line.runs}pts`);
  if (line.fifteens) parts.push(`fifteens: ${line.fifteens}pts`);
  if (line.flushes) parts.push(`flush: ${line.flushes}pts`);
  if (line.knobs) parts.push(`knobs: ${line.knobs}pt`);
  return parts.length ? parts.join(", ") : "no points";
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
  isFinalRound
}: ChildProps) {
  const rowLines = lineScores?.[0] ?? [];
  const colLines = lineScores?.[1] ?? [];
  const hasLineBreakdown = rowLines.length === 5 && colLines.length === 5;

  const rowTeamRoundScore = roundScores[0].total; // includes crib + heels, added server-side
  const colTeamRoundScore = roundScores[1].total;
  const pointDiff = Math.abs(rowTeamRoundScore - colTeamRoundScore);
  const winner = rowTeamRoundScore >= colTeamRoundScore ? "Row" : "Column";

  const TOTAL_LINES = 5;
  const [revealStep, setRevealStep] = useState(hasLineBreakdown ? 0 : TOTAL_LINES * 2);
  const [showBonus, setShowBonus] = useState(!hasLineBreakdown);
  const [raceStarted, setRaceStarted] = useState(!hasLineBreakdown);
  const [raceDone, setRaceDone] = useState(!hasLineBreakdown);
  const [showFinal, setShowFinal] = useState(!hasLineBreakdown);
  const [peek, setPeek] = useState(false);
  const rowRevealed = Math.min(revealStep, TOTAL_LINES);
  const colRevealed = Math.max(0, revealStep - TOTAL_LINES);
  const [raceRow, setRaceRow] = useState(hasLineBreakdown ? rowTeamRoundScore : 0);
  const [raceCol, setRaceCol] = useState(hasLineBreakdown ? colTeamRoundScore : 0);

  // Stage progression: lines -> bonus -> race (separate effect) -> final
  useEffect(() => {
    if (!hasLineBreakdown) return;
    if (revealStep < TOTAL_LINES * 2) {
      const t = setTimeout(() => setRevealStep((n) => n + 1), LINE_REVEAL_DELAY_MS);
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
  }, [revealStep, showBonus, raceStarted, raceDone, showFinal, hasLineBreakdown]);

  // Subtract race: both counters tick down together; the smaller hits exactly 0
  // on the final tick, and whatever remains on the other side IS the point diff.
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
    setRevealStep(TOTAL_LINES * 2);
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

  const rowRunningTotal = rowLines.slice(0, rowRevealed).reduce((sum, l) => sum + l.total, 0);
  const colRunningTotal = colLines.slice(0, colRevealed).reduce((sum, l) => sum + l.total, 0);

  const peekHandlers = {
    onMouseEnter: () => setPeek(true),
    onMouseLeave: () => setPeek(false),
    onMouseDown: () => setPeek(true),
    onMouseUp: () => setPeek(false),
    onTouchStart: () => setPeek(true),
    onTouchEnd: () => setPeek(false),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 40 }}
      animate={{ opacity: peek ? 0.15 : 0.95, scale: 1, y: 0 }}
      transition={{
        scale: { type: "spring", stiffness: 260, damping: 22 },
        y: { type: "spring", stiffness: 260, damping: 22 },
        opacity: { duration: peek ? 0.15 : 0.4, ease: "easeOut" },
        delay: 0.2,
      }}
      className="absolute inset-0 mx-auto my-auto w-[320px] h-[600px] md:w-[600px] md:h-[700px] lg:w-[650px] lg:h-[750px] p-5 bg-game-panel text-white rounded-lg border-2 border-solid border-slate-800 text-sm md:text-base overflow-y-auto"
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

      {/* Line-by-line reveal — each line is a single row: "Row 1 | breakdown" ... "+total" */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <h3 className="font-bold md:text-xl text-cyan-400 text-center mb-2">Row</h3>
          <div className="space-y-1">
            <AnimatePresence>
              {rowLines.slice(0, rowRevealed).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[11px] md:text-xs bg-black/20 rounded px-2 py-1 flex items-baseline justify-between gap-2"
                >
                  <span className="text-white/80 truncate">
                    <span className="font-semibold text-white">Row {i + 1}</span>
                    <span className="text-white/40 mx-1">|</span>
                    {describeLine(line)}
                  </span>
                  <span className="font-bold text-cyan-300 shrink-0">+{line.total}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-right mt-1 font-bold text-cyan-300">Running: {rowRunningTotal}</p>
        </div>

        <div>
          <h3 className="font-bold md:text-xl text-fuchsia-400 text-center mb-2">Column</h3>
          <div className="space-y-1">
            <AnimatePresence>
              {colLines.slice(0, colRevealed).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[11px] md:text-xs bg-black/20 rounded px-2 py-1 flex items-baseline justify-between gap-2"
                >
                  <span className="text-white/80 truncate">
                    <span className="font-semibold text-white">Col {i + 1}</span>
                    <span className="text-white/40 mx-1">|</span>
                    {describeLine(line)}
                  </span>
                  <span className="font-bold text-fuchsia-300 shrink-0">+{line.total}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-right mt-1 font-bold text-fuchsia-300">Running: {colRunningTotal}</p>
        </div>
      </div>

      {/* Crib box — cards get 2/3 width, breakdown gets 1/3, smaller card images */}
      <AnimatePresence>
        {showBonus && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            {cribScore && (
              <div className="bg-game-panel rounded-lg p-2 border border-white/10 mb-2">
                <h3 className="font-bold md:text-xl text-white text-center mb-2">Crib ({dealerTeam})</h3>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="col-span-2 flex justify-center flex-wrap gap-1">
                    {cribHand.map((card, i) => (
                      <img
                        key={i}
                        src={`/cards/fronts/${card.suit}_${card.name}.svg`}
                        alt={`${card.name} of ${card.suit}`}
                        className="flex-1 min-w-0 h-auto aspect-[2.5/3.5] object-contain"
                      />
                    ))}
                  </div>
                  <div className="col-span-1 text-[10px] md:text-xs space-y-0.5">
                    <p className="text-center md:text-lg font-bold text-white mb-1">+{cribScore.total}pts</p>
                    <p>pairs: {cribScore.pairs}</p>
                    <p>runs: {cribScore.runs}</p>
                    <p>15s: {cribScore.fifteens}</p>
                    <p>flush: {cribScore.flushes}</p>
                    <div className="text-center space-y-0.5 mb-3">
                      {/* {cribScore && <p className="text-orange-400 text-sm">{dealerTeam} crib: +{cribPoints}</p>} */}
                      {heels > 0 && <p className="text-orange-400 text-sm">His Heels: +{heels}pts</p>}
                    </div>
                  </div>
                  
                </div>
              </div>
            )}

            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtract race */}
      <AnimatePresence>
        {raceStarted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
            <div className="flex justify-around items-center">
              <motion.p className="text-2xl md:text-4xl font-bold text-cyan-300 tabular-nums">
                {Math.round(raceRow)}
              </motion.p>
              <span className="text-white/40 text-lg">vs</span>
              <motion.p className="text-2xl md:text-4xl font-bold text-fuchsia-300 tabular-nums">
                {Math.round(raceCol)}
              </motion.p>
            </div>

            {raceDone && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`font-semibold md:text-lg rounded-md italic w-fit px-4 mx-auto mt-3 text-center ${
                  pointDiff === 0 ? "bg-slate-500" : "bg-emerald-600"
                }`}
              >
                {pointDiff === 0 ? "It's a tie — no points awarded" : `${winner} earns ${pointDiff} points!`}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear visual break before the game-total scoreboard */}
      <AnimatePresence>
        {showFinal && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-[11px] uppercase tracking-widest text-white/40">Game Score</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            <div className="bg-black/25 rounded-lg p-3 border border-white/10">
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-cyan-400 font-bold">Row</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">{totalScores[0]}</p>
                </div>
                <div className="text-center">
                  <p className="text-fuchsia-400 font-bold">Column</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">{totalScores[1]}</p>
                </div>
              </div>
            </div>

            <button
              className="w-full bg-blue-500 text-white font-bold rounded-xl md:text-xl border-white border-2 hover:bg-blue-600 py-2 mt-3 transition-colors duration-300 cursor-pointer"
              onClick={nextRound}
            >
              {isFinalRound ? "See Final Results" : "Next Round"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}