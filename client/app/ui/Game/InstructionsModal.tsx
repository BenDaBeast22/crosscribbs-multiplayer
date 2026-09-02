import React, { useEffect, useRef, useState } from "react";

type Props = {
  onClose: () => void;
};

const scoringRows = [
  { method: "Pair", detail: "2 matching cards", points: "2" },
  { method: "Three of a kind", detail: "3 matching cards", points: "6" },
  { method: "Four of a kind", detail: "4 matching cards", points: "12" },
  { method: "Fifteen", detail: "Cards summing to 15", points: "2" },
  { method: "Run", detail: "Sequence of 3–5 cards", points: "1 per card" },
  { method: "Flush", detail: "4 or 5 cards, same suit", points: "4 or 5" },
  { method: "His Knobs", detail: "Jack matching cut card's suit, in the middle row/column", points: "1" },
  { method: "His Heels", detail: "Cut card is a Jack — dealer scores", points: "2" },
];

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
        className={`relative bg-slate-800 bg-opacity-95 text-white rounded-lg p-6 max-w-2xl md:max-w-3xl mx-4 max-h-[85vh] overflow-y-auto shadow-lg transform transition-all duration-200 ${
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

          <p className="mb-1">Basic controls:</p>
          <ul className="list-disc list-inside mb-3">
            <li>Click cards to select or play them.</li>
            <li>Use the HUD buttons to end turns or interact with the crib.</li>
            <li>Scores update after each round — rows are cyan, columns are fuchsia.</li>
          </ul>

          <h3 className="text-lg font-semibold mb-1">Crib Scoring</h3>
          <p className="mb-3 text-white/70">
            The game is won at 31 points. Card values are 1–10; face cards count as 10.
          </p>

          {/* Scoring table */}
          <div className="rounded-lg overflow-hidden border border-white/10 mb-3">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-black/30 text-white/70">
                  <th className="px-3 py-2 font-semibold">Method</th>
                  <th className="px-3 py-2 font-semibold hidden md:table-cell">Detail</th>
                  <th className="px-3 py-2 font-semibold text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {scoringRows.map((row, i) => (
                  <tr
                    key={row.method}
                    className={`${i % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent"} border-t border-white/10`}
                  >
                    <td className="px-3 py-2 font-medium">{row.method}</td>
                    <td className="px-3 py-2 text-white/60 hidden md:table-cell">{row.detail}</td>
                    <td className="px-3 py-2 text-right font-semibold text-amber-300">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mb-2 text-white/70">
            After each round, the row and column hands are scored and the crib hand's
            score is added to the dealer's total. The difference between the row and
            column scores for that round is then added to the round winner's game score.
          </p>

          <p className="mb-0 italic text-xs text-white/40">
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