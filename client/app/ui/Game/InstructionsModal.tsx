import React, { useEffect, useRef, useState } from "react";

type Props = {
  onClose: () => void;
};

export default function InstructionsModal({ onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    // small delay so CSS transition runs on mount
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-white/20 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-title"
        className={`relative bg-slate-800 bg-opacity-95 text-white rounded-lg p-6 max-w-2xl mx-4 shadow-lg transform transition-all duration-200 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h2 id="instructions-title" className="text-lg font-semibold mb-2">
          How to Play
        </h2>
        <div className="text-sm leading-relaxed">
          <p className="mb-2">
            Cross Cribbs is a two-axis cribbage-style game. Players score points
            by creating combinations in rows and columns. Each hand contributes
            to both the row and column totals.
          </p>

          <p className="mb-2">Basic controls:</p>
          <ul className="list-disc list-inside mb-2">
            <li>Click cards to select or play them.</li>
            <li>Use the HUD buttons to end turns or interact with the crib.</li>
            <li>
              Scores update after each round — rows are cyan, columns are fuchsia.
            </li>
          </ul>

          <h3 className="mt-3 text-lg font-semibold">
            Crib Scoring - The game is won at 31 points.{" "}
          </h3>
          <p className="mb-2">
            Card values: 1 - 10. Face cards count as 10.
          </p>

          <p className="mb-1 font-medium">Scoring methods:</p>
          <ul className="list-disc list-inside mb-2">
            <li>
              Pairs/Multiples: pair = 2 points, three of a kind = 6 points, four
              of a kind = 12 points.
            </li>
            <li>
              Fifteen: combinations that sum to 15 score points = 2 points.
            </li>
            <li>Run: sequences of 3–5 cards = 1 point for each card in run.</li>
            <li>Flush: 4 or 5 cards of the same suit = 4 or 5 points.</li>
            <li>
              His Knobs: a Jack that matches the suit of the cut/middle card
              played in middle row/column = 1 point.
            </li>
            <li>
              His Heels: if the cut card (center) is a Jack = the dealer receives
              2 points.
            </li>
          </ul>

          <p className="mb-2">
            After each round, the row and col hands are scored and the crib hand score is added to the dealer's / crib owner's round points.
            Lastly the difference between row and col score for that round is added to the round winner's total score.
          </p>

          <p className="mb-0 italic text-xs">
            Tip: press Esc or click outside this box to close.
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            ref={closeBtnRef}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1.5 px-3 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
