import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getPlayerColor, getTeamLabel, isRowTeam } from "~/helpers";

type ChildProps = {
  isOpen: boolean;
  onDismiss: () => void;
  dealer: number | null;
  numPlayers: number;
  playerNames: string[];
  totalScores: [number, number];
  isFirstRound: boolean;
};

const AUTO_DISMISS_MS = 4000;
const COIN_FLIP_DURATION_S = 1.8;

export default function RoundStartPopup({
  isOpen,
  onDismiss,
  dealer,
  numPlayers,
  playerNames,
  totalScores,
  isFirstRound,
}: ChildProps) {
  const [flipDone, setFlipDone] = useState(!isFirstRound);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dealerIsRow = dealer !== null ? isRowTeam(dealer) : true;
  const dealerTeamLabel = dealer !== null ? getTeamLabel(dealer) : "Row";
  const firstPlayerIndex = dealer !== null ? (dealer >= numPlayers ? 1 : dealer + 1) : 1;
  const firstPlayerIsRow = isRowTeam(firstPlayerIndex);
  const isTeamMode = numPlayers === 4;

  const dealerName = isTeamMode ? `${dealerTeamLabel} Team` : playerNames[(dealer ?? 1) - 1] || dealerTeamLabel;
  const firstPlayerName = isTeamMode
    ? `${firstPlayerIsRow ? "Row" : "Column"} Team`
    : playerNames[firstPlayerIndex - 1] || (firstPlayerIsRow ? "Row" : "Column");

  // Reset flip state each time the popup opens, so round 1 always replays the flip
  useEffect(() => {
    if (isOpen) setFlipDone(!isFirstRound);
  }, [isOpen, isFirstRound]);

  // Auto-dismiss once settled — immediately for later rounds, after the flip finishes on round 1
  useEffect(() => {
    if (!isOpen || !flipDone) return;
    dismissTimerRef.current = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [isOpen, flipDone, onDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="round-start-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => flipDone && onDismiss()}
        >
          <motion.div
            key="round-start-card"
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wide mb-4">
              {isFirstRound ? "Coin Toss" : "Round Start"}
            </h3>

            {isFirstRound && !flipDone ? (
              <CoinFlip dealerIsRow={dealerIsRow} onSettled={() => setFlipDone(true)} />
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-white/50 text-xs mb-1">Dealer</p>
                  <p className={`text-xl font-bold ${dealerIsRow ? "text-cyan-400" : "text-fuchsia-400"}`}>
                    {dealerName}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-xs mb-1">Goes First</p>
                  <p className={`text-lg font-semibold ${firstPlayerIsRow ? "text-cyan-400" : "text-fuchsia-400"}`}>
                    {firstPlayerName}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-700 flex justify-center gap-6">
                  <div>
                    <p className="text-cyan-400 text-xs font-semibold">Row</p>
                    <p className="text-white text-lg font-bold">{totalScores[0]}</p>
                  </div>
                  <div>
                    <p className="text-fuchsia-400 text-xs font-semibold">Column</p>
                    <p className="text-white text-lg font-bold">{totalScores[1]}</p>
                  </div>
                </div>
                <button
                  onClick={onDismiss}
                  className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  Let's Play
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CoinFlip({ dealerIsRow, onSettled }: { dealerIsRow: boolean; onSettled: () => void }) {
  // 5 full spins, landing on the front face (Row, 0deg) or back face (Column, 180deg)
  const targetRotation = 360 * 5 + (dealerIsRow ? 0 : 180);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-24 h-24" style={{ perspective: 800 }}>
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: targetRotation }}
          transition={{ duration: COIN_FLIP_DURATION_S, ease: [0.2, 0.8, 0.3, 1] }}
          onAnimationComplete={onSettled}
        >
          <div
            className="absolute inset-0 rounded-full bg-cyan-400 flex items-center justify-center text-slate-900 font-bold text-sm shadow-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            Row
          </div>
          <div
            className="absolute inset-0 rounded-full bg-fuchsia-400 flex items-center justify-center text-slate-900 font-bold text-sm shadow-lg"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            Column
          </div>
        </motion.div>
      </div>
      <p className="text-white/50 text-xs">Flipping for dealer...</p>
    </div>
  );
}
