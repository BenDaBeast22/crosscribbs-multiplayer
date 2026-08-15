import React, { useEffect, useState } from "react";
import InstructionsModal from "./InstructionsModal";
import ScorePegboard from "./ScorePegboard";
import { motion } from "framer-motion";

type ChildProps = {
  totalScores: [number, number];
  backToMenu: () => void;
  turn: number; 
  paused?: boolean;
  playerNames: string[];
  dealer: number | null; 
};

export default function Header({ totalScores, backToMenu, turn, paused, playerNames, dealer }: ChildProps) {
  const rowScore = totalScores[0];
  const colScore = totalScores[1];
  const [showInstructions, setShowInstructions] = useState(false);
  const TURN_TIMER_SECONDS = 45;
  const [timeLeft, setTimeLeft] = useState(TURN_TIMER_SECONDS);

  const DISCO_DURATION_MS = 6000;
  const [discoActive, setDiscoActive] = useState(false);

  useEffect(() => {
    setTimeLeft(TURN_TIMER_SECONDS); // reset whenever turn changes
    if (paused) return; // don't start a fresh interval while paused

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) return 0; // stop at zero, do nothing yet
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [turn, paused]);


  const triggerDisco = () => {
    if (discoActive) return; // ignore spam-clicks while already running
    setDiscoActive(true);
    document.body.classList.add("disco-mode");

    setTimeout(() => {
      document.body.classList.remove("disco-mode");
      setDiscoActive(false);
    }, DISCO_DURATION_MS);
  };


  return (
    <div className="Header bg-game-panel flex flex-col">
      <div className="flex items-center md:p-2">
        <div className="left-buttons w-1/3 text-xs md:text-sm text-white p-2 flex items-center flex-nowrap gap-2">
          <button
            className="bg-gray-500 hover:bg-gray-600 font-bold py-1.5 px-2 md:px-4 rounded transition-colors duration-200 cursor-pointer"
            onClick={backToMenu}
          >
            Back to Menu
          </button>
          <button
            className="hidden md:inline bg-gray-500 hover:bg-gray-600 font-bold py-1.5 px-4 rounded transition-colors duration-200 cursor-pointer"
            onClick={() => setShowInstructions(true)}
            aria-haspopup="dialog"
            aria-expanded={showInstructions}
          >
            Instructions
          </button>

          {/* turn timer */}
          <motion.div
            onClick={triggerDisco} 
            animate={timeLeft <= 10 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={timeLeft <= 10 ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            className={`flex items-center gap-1.5 py-1.5 px-2 md:px-4 rounded font-bold transition-colors duration-300 cursor-pointer ${
              timeLeft <= 10 ? "bg-red-500/20 text-red-400" : "bg-gray-500 text-white"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              <circle
                cx="8"
                cy="8"
                r="6.5"
                fill="none"
                stroke={timeLeft <= 10 ? "#f87171" : "#67e8f9"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 6.5}
                strokeDashoffset={2 * Math.PI * 6.5 * (1 - timeLeft / TURN_TIMER_SECONDS)}
                transform="rotate(-90 8 8)"
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
              />
            </svg>
            <span>{timeLeft}s</span>
          </motion.div>

          {/* NEW — turn indicator, right of the timer */}
          {playerNames.length > 0 && turn > 0 && turn <= playerNames.length && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] md:text-xs shrink-0">
              {/* <span className="text-white/60">Current turn:</span> */}
              <span className={`w-2 h-2 rounded-full ${turn % 2 !== 0 ? "bg-cyan-400" : "bg-fuchsia-400"}`} />
              <span className="text-white/80 font-medium truncate max-w-20">{playerNames[turn - 1]}</span>
              <span className={turn % 2 !== 0 ? "text-cyan-400" : "text-fuchsia-400"}>
                ({turn % 2 !== 0 ? "Row" : "Column"})
              </span>
              {dealer === turn && <span className="text-white/40 italic">· Dealer</span>}
            </div>
          )}

        </div>
        <h1 className="title w-1/3 text-white text-center text-lg md:text-2xl font-semibold">Cross Cribbs</h1>
        <div className="hidden md:flex total-score w-1/3 justify-end md:gap-4 text-[10px] md:text-xl font-medium md:mr-4 mr-2">
          <span className="text-white">Total Score: </span>
          <span className="text-cyan-400">Row: {rowScore}</span>
          <span className="text-fuchsia-400">Column: {colScore}</span>
        </div>
      </div>

      <div className="md:hidden flex justify-center gap-3 text-sm italic mb-2">
        <span className="text-white">Total Score: </span>
        <span className="text-cyan-400">Row: {rowScore}</span>
        <span className="text-fuchsia-400">Column: {colScore}</span>
      </div>

      {/* pegboard visualization under header */}
      <ScorePegboard rowScore={rowScore} colScore={colScore} />

      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
    </div>
  );
}
