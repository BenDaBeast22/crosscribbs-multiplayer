import React, { useEffect, useState } from "react";
import InstructionsModal from "./InstructionsModal";
import ScorePegboard from "./ScorePegboard";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

type ChildProps = {
  totalScores: [number, number];
  backToMenu: () => void;
  turn: number;
  paused?: boolean;
  playerNames: string[];
  dealer: number | null;
  isSpectator?: boolean;
  spectatorCount?: number;
  lobbyId?: string;
  showLiveScoring?: boolean;
  toggleLiveScoring?: () => void;
};

export default function Header({
  totalScores,
  backToMenu,
  turn,
  paused,
  playerNames,
  dealer,
  isSpectator,
  spectatorCount = 0,
  lobbyId,
  showLiveScoring,
  toggleLiveScoring,
}: ChildProps) {
  const rowScore = totalScores[0];
  const colScore = totalScores[1];
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleCopyLobbyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lobbyId) return;
    try {
      await navigator.clipboard.writeText(lobbyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed silently — non-critical
    }
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

  const showSpectatorCount = !isSpectator && spectatorCount > 0;
  const hasSpectatorInfo = isSpectator || showSpectatorCount;

  // Compact spectator/viewer badges — reused inline (desktop, next to lobby
  // code) and in the absolutely-positioned mobile title-adjacent slot.
  const renderSpectatorContent = (size: "mobile" | "desktop") => {
    if (!hasSpectatorInfo) return null;
    const textSize = size === "mobile" ? "text-[9px]" : "text-[11px]";
    const padding = size === "mobile" ? "px-1.5 py-0.5" : "px-2 py-0.5";
    const gap = size === "mobile" ? "gap-1" : "gap-1.5";

    return (
      <div className={`flex items-center ${gap} flex-wrap whitespace-nowrap`}>
        {isSpectator && (
          <span className={`bg-amber-500/90 text-black font-bold ${textSize} ${padding} rounded-full`}>
            👁 Spectating
          </span>
        )}
        {showSpectatorCount && (
          <span className={`bg-slate-700 text-white/70 font-semibold ${textSize} ${padding} rounded-full`}>
            👁 {spectatorCount}
            {size === "desktop" ? " watching" : ""}
          </span>
        )}
      </div>
    );
  };

  // Lobby code badge — absolutely positioned tight against the RIGHT edge of
  // the title text (the wrapper is inline-flex, shrink-wrapped to the <h1>),
  // so its presence/absence never affects the title's own centering.
  // On desktop, spectator info renders immediately after it in the same slot.
  const renderLobbyBadge = (size: "mobile" | "desktop") => {
    if (!lobbyId) return null;
    const textSize = size === "mobile" ? "text-[9px]" : "text-[11px]";
    const padding = size === "mobile" ? "px-1.5 py-0.5" : "px-2 py-0.5";

    return (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 flex items-center gap-1.5 whitespace-nowrap">
        <button
          onClick={handleCopyLobbyId}
          className={`flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white/80 font-semibold ${textSize} ${padding} rounded-full transition-colors cursor-pointer`}
          title="Copy lobby code"
        >
          <span>#{lobbyId}</span>
          {copied ? <Check size={size === "mobile" ? 9 : 11} /> : <Copy size={size === "mobile" ? 9 : 11} />}
        </button>
        {size === "desktop" && renderSpectatorContent("desktop")}
      </div>
    );
  };

  // Spectator badges to the LEFT of the title — mobile only now, since desktop
  // moved this info to sit right of the lobby code instead.
  const renderSpectatorBadgesLeft = (size: "mobile" | "desktop") => {
    if (!hasSpectatorInfo) return null;
    const gap = size === "mobile" ? "gap-1" : "gap-1.5";

    return (
      <div
        className={`absolute right-full top-1/2 -translate-y-1/2 mr-2 flex items-center ${gap} flex-wrap whitespace-nowrap`}
      >
        {renderSpectatorContent(size)}
      </div>
    );
  };

  return (
    <div className="Header bg-game-panel flex flex-col relative">
      {/* DESKTOP TOP ROW (lg+ only): Buttons (Left) | Title, always centered (Center) | Live Toggle + Total Scores (Right) */}
      <div className="hidden lg:grid grid-cols-3 items-center px-4 pt-3 pb-1">
        {/* Left: Action Buttons */}
        <div className="flex items-center gap-3 justify-self-start">
          <button
            className="bg-gray-500 hover:bg-gray-600 font-bold py-1.5 px-3.5 text-xs sm:text-sm rounded transition-colors duration-200 cursor-pointer"
            onClick={backToMenu}
          >
            Back to Menu
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 font-bold py-1.5 px-3.5 text-xs sm:text-sm rounded transition-colors duration-200 cursor-pointer"
            onClick={() => setShowInstructions(true)}
            aria-haspopup="dialog"
            aria-expanded={showInstructions}
          >
            Instructions
          </button>
        </div>

        {/* Center: Title — wrapper shrink-wraps to the <h1> so the lobby code
            (+ spectator info right after it) anchors tight against the text
            edge, and the wrapper itself stays centered */}
        <div className="relative inline-flex justify-self-center">
          <h1 className="title text-white text-center text-xl md:text-2xl font-semibold whitespace-nowrap">
            Cross Cribbs
          </h1>
          {renderLobbyBadge("desktop")}
        </div>

        {/* Right: Live Scores toggle (left of Total Score) + Scores */}
        <div className="flex items-center gap-3 justify-self-end">
          {toggleLiveScoring && (
            <button
              className={`font-bold py-1 px-3 text-xs rounded transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                showLiveScoring
                  ? "bg-cyan-900/70 hover:bg-cyan-800/80 text-cyan-300 border border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]"
                  : "bg-gray-700/80 hover:bg-gray-600 text-gray-300 border border-gray-600"
              }`}
              onClick={toggleLiveScoring}
              title="Toggle live row and column scores on the board"
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  showLiveScoring ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]" : "bg-gray-500"
                }`}
              />
              Live Scores: {showLiveScoring ? "ON" : "OFF"}
            </button>
          )}
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="text-white">Total Score:</span>
            <span className="text-cyan-400">Row: {rowScore}</span>
            <span className="text-fuchsia-400">Column: {colScore}</span>
          </div>
        </div>
      </div>

      {/* DESKTOP SECOND ROW (lg+ only): Turn Indicator & Timer */}
      <div className="hidden lg:flex items-center justify-center gap-3 pb-2 pt-1">
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

        <motion.div
          onClick={triggerDisco}
          animate={timeLeft <= 10 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={timeLeft <= 10 ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
          className={`flex items-center gap-1.5 py-0 px-3 rounded-full font-bold transition-colors duration-300 cursor-pointer ${
            timeLeft <= 10
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-gray-700/80 text-cyan-300 border border-gray-600"
          }`}
        >
          {renderTimerIcon()}
          <span className="text-xs">{timeLeft}s</span>
        </motion.div>
      </div>

      {/* MOBILE BAR LAYOUT (applies through sm and md, hidden at lg+): Menu | Title, always centered | Help */}
      <div className="lg:hidden flex items-center justify-between w-full px-2 pt-2 pb-1 text-xs select-none">
        <button
          className="bg-gray-600/80 hover:bg-gray-600 text-white font-bold py-1 px-2.5 rounded transition-colors duration-200 cursor-pointer shrink-0"
          onClick={backToMenu}
        >
          Menu
        </button>

        <div className="relative flex-1 flex justify-center min-w-0">
          <span className="relative inline-flex">
            <h1 className="title text-white font-semibold text-sm whitespace-nowrap">Cross Cribbs</h1>
            {renderSpectatorBadgesLeft("mobile")}
            {renderLobbyBadge("mobile")}
          </span>
        </div>

        <button
          className="bg-gray-600/80 hover:bg-gray-600 text-white font-bold py-1 px-2.5 rounded transition-colors duration-200 cursor-pointer shrink-0"
          onClick={() => setShowInstructions(true)}
          aria-haspopup="dialog"
          aria-expanded={showInstructions}
        >
          Help
        </button>
      </div>

      {/* MOBILE-ONLY COMBINED ROW (applies through sm and md, hidden at lg+): Player Turn + Timer + Divider + Total Score + Live Toggle */}
      <div className="lg:hidden flex items-center justify-center gap-2 px-2 mb-1.5 text-xs">
        {playerNames.length > 0 && turn > 0 && turn <= playerNames.length && (
          <div className="flex items-center gap-1.5 shrink-0 bg-black/10 py-0.5 px-2 rounded-full">
            <span className={`w-2 h-2 rounded-full ${turn % 2 !== 0 ? "bg-cyan-400" : "bg-fuchsia-400"}`} />
            <span className="text-white/80 font-medium truncate max-w-20">{playerNames[turn - 1]}</span>
            <span className={turn % 2 !== 0 ? "text-cyan-400" : "text-fuchsia-400"}>
              ({turn % 2 !== 0 ? "R" : "C"})
            </span>
            {dealer === turn && <span className="text-white/40 italic">· D</span>}

            {/* Timer */}
            <motion.div
              onClick={triggerDisco}
              animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={timeLeft <= 10 ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
              className={`flex items-center gap-1 ml-1 py-0.5 px-1.5 rounded text-[11px] font-bold border transition-colors ${
                timeLeft <= 10
                  ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-gray-700/50 border-gray-600 text-cyan-300"
              }`}
            >
              {renderTimerIcon()}
              <span>{timeLeft}s</span>
            </motion.div>

            {/* Divider */}
            <span className="h-3 border-l border-white/20 mx-0.5" aria-hidden="true" />

            {/* Total Score Inline */}
            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
              <span className="text-cyan-400">R: {rowScore}</span>
              <span className="text-fuchsia-400">C: {colScore}</span>
            </div>

            {/* Live Scores toggle, beside total score */}
            {toggleLiveScoring && (
              <button
                className={`flex items-center gap-1 ml-1 py-0.5 px-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                  showLiveScoring
                    ? "bg-cyan-900/80 text-cyan-300 border-cyan-400/60"
                    : "bg-gray-700/80 text-gray-300 border-gray-600"
                }`}
                onClick={toggleLiveScoring}
                title="Toggle live row and column scores on the board"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showLiveScoring ? "bg-cyan-400" : "bg-gray-500"}`} />
                Live
              </button>
            )}
          </div>
        )}
      </div>

      <ScorePegboard rowScore={rowScore} colScore={colScore} />
      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
    </div>
  );
}
