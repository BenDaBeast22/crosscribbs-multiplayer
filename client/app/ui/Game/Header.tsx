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

  const renderTimerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0">
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
  );

  return (
    <div className="Header bg-game-panel flex flex-col relative">
      {/* MOBILE BAR LAYOUT */}
      <div className="md:hidden flex items-center justify-between px-3 pt-2 pb-1 text-xs select-none">
        <button
          className="bg-gray-600/80 hover:bg-gray-600 text-white font-bold py-1 px-2.5 rounded transition-colors duration-200 cursor-pointer"
          onClick={backToMenu}
        >
          Menu
        </button>

        <h1 className="title text-white font-semibold text-sm">Cross Cribbs</h1>

        <button
          className="bg-gray-600/80 hover:bg-gray-600 text-white font-bold py-1 px-2.5 rounded transition-colors duration-200 cursor-pointer"
          onClick={() => setShowInstructions(true)}
          aria-haspopup="dialog"
          aria-expanded={showInstructions}
        >
          Help
        </button>
      </div>

      {/* DESKTOP BRANDING BAR */}
      <h1 className="hidden md:block title text-white text-center text-lg md:text-2xl font-semibold pt-2 pb-1">
        Cross Cribbs
      </h1>

      {/* CONTROLS TRACK BAR CONTAINER: Changed to a 3-column grid structure on desktop */}
      <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-2 md:gap-0 px-2 md:px-4 md:pb-2 text-xs md:text-sm">
        {/* Left Column: Action buttons (Desktop Only) */}
        <div className="hidden md:flex items-center gap-4 justify-self-start">
          <button
            className="bg-gray-500 hover:bg-gray-600 font-bold py-1.5 px-4 rounded transition-colors duration-200 cursor-pointer"
            onClick={backToMenu}
          >
            Back to Menu
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 font-bold py-1.5 px-4 rounded transition-colors duration-200 cursor-pointer"
            onClick={() => setShowInstructions(true)}
            aria-haspopup="dialog"
            aria-expanded={showInstructions}
          >
            Instructions
          </button>
        </div>

        {/* Center Column: Turn Indicator + Timer (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3 justify-self-center">
          {playerNames.length > 0 && turn > 0 && turn <= playerNames.length && (
            <div className="flex items-center gap-2 text-sm shrink-0">
              <span className={`w-2 h-2 rounded-full ${turn % 2 !== 0 ? "bg-cyan-400" : "bg-fuchsia-400"}`} />
              <span className="text-white/80 font-bold truncate max-w-28">{playerNames[turn - 1]}</span>
              <span className={turn % 2 !== 0 ? "text-cyan-400" : "text-fuchsia-400"}>
                ({turn % 2 !== 0 ? "Row" : "Column"})
              </span>
              {dealer === turn && <span className="text-white/40 italic">· Dealer</span>}
            </div>
          )}

          {/* Desktop Centralized Timer */}
          <motion.div
            onClick={triggerDisco}
            animate={timeLeft <= 10 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={timeLeft <= 10 ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-full font-bold transition-colors duration-300 cursor-pointer ${
              timeLeft <= 10
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-gray-700/80 text-cyan-300 border border-gray-600"
            }`}
          >
            {renderTimerIcon()}
            <span>{timeLeft}s</span>
          </motion.div>
        </div>

        {/* Mobile-Only Combined View: Retained fallback for clean mobile output sizing */}
        <div className="md:hidden flex items-center justify-center mb-1">
          {playerNames.length > 0 && turn > 0 && turn <= playerNames.length && (
            <div className="flex items-center gap-2 text-xs shrink-0 bg-black/10 rounded-full">
              <span className={`w-2 h-2 rounded-full ${turn % 2 !== 0 ? "bg-cyan-400" : "bg-fuchsia-400"}`} />
              <span className="text-white/80 font-medium truncate max-w-24">{playerNames[turn - 1]}</span>
              <span className={turn % 2 !== 0 ? "text-cyan-400" : "text-fuchsia-400"}>
                ({turn % 2 !== 0 ? "Row" : "Column"})
              </span>
              {dealer === turn && <span className="text-white/40 italic">· Dealer</span>}

              <motion.div
                onClick={triggerDisco}
                animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={timeLeft <= 10 ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                className={`flex items-center gap-1 ml-2 py-0.5 px-1.5 rounded text-[11px] font-bold border transition-colors ${
                  timeLeft <= 10
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-gray-700/50 border-gray-600 text-cyan-300"
                }`}
              >
                {renderTimerIcon()}
                <span>{timeLeft}s</span>
              </motion.div>
            </div>
          )}
        </div>

        {/* Right Column: Score Panel (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3 text-sm font-medium justify-self-end">
          <span className="text-white">Total Score:</span>
          <span className="text-cyan-400">Row: {rowScore}</span>
          <span className="text-fuchsia-400">Column: {colScore}</span>
        </div>
      </div>

      {/* Mobile Score Panel Row View */}
      <div className="md:hidden flex justify-center gap-3 text-xs italic mb-1.5">
        <span className="text-white/60">Total Score: </span>
        <span className="text-cyan-400">Row: {rowScore}</span>
        <span className="text-fuchsia-400">Column: {colScore}</span>
      </div>

      <ScorePegboard rowScore={rowScore} colScore={colScore} />
      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
    </div>
  );
}
