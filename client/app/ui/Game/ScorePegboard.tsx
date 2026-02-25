import React from "react";

type Props = {
  rowScore: number;
  colScore: number;
  maxPoints?: number; // default 31
};

const MAX_DEFAULT = 31;

export default function ScorePegboard({
  rowScore,
  colScore,
  maxPoints = MAX_DEFAULT,
}: Props) {
  // clamp scores to [0, maxPoints]
  const row = Math.min(Math.max(rowScore, 0), maxPoints);
  const col = Math.min(Math.max(colScore, 0), maxPoints);
  const dots = Array.from({ length: maxPoints }, (_, i) => i);

  return (
    <div className="score-pegboard bg-slate-700 flex flex-col items-center px-2 py-3 ">
      {/* row team */}
      <div
        className="flex space-x-1 overflow-x-auto"
        aria-label={`Row score: ${row} of ${maxPoints}`}
      >
        {dots.map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < row ? "bg-cyan-400" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
      {/* column team */}
      <div
        className="flex space-x-1 overflow-x-auto mt-1"
        aria-label={`Column score: ${col} of ${maxPoints}`}
      >
        {dots.map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < col ? "bg-fuchsia-400" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
