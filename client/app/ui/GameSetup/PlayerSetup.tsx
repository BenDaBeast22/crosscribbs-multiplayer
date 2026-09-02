import { useState } from "react";
import BackButton from "./BackButton";

type ChildProps = {
  numPlayers: 2 | 4;
  onSetPlayerNames: (playerNames: string[]) => void;
  onBack: () => void;
};

// Index maps directly to player.num (0-3). Even nums = Row team, odd = Column team.
// Row players share a blue family (cyan/navy), Column players share a pink family
// (fuchsia/rose) — same hue family signals "same team," different shade signals
// "different player." Keep this order in sync with PLAYER_OUTLINE_COLORS in Player.tsx.
const PLAYER_COLORS = [
  { name: "Cyan", swatch: "bg-cyan-400", ring: "ring-cyan-400", team: "Row" },
  { name: "Fuchsia", swatch: "bg-fuchsia-400", ring: "ring-fuchsia-400", team: "Column" },
  { name: "Navy", swatch: "bg-blue-800", ring: "ring-blue-800", team: "Row" },
  { name: "Rose", swatch: "bg-pink-800", ring: "ring-pink-800", team: "Column" },
];

export default function PlayerSetup({ numPlayers, onSetPlayerNames, onBack }: ChildProps) {
  // Auto-assign color names immediately — no typing required to start
  const [playerNames, setPlayerNames] = useState<string[]>(() =>
    Array.from({ length: numPlayers }, (_, i) => PLAYER_COLORS[i].name),
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  // Falls back to the color name if someone clears the field entirely
  const handleBlur = (index: number) => {
    if (playerNames[index].trim() === "") {
      handleNameChange(index, PLAYER_COLORS[index].name);
    }
    setEditingIndex(null);
  };

  const isTeamMode = numPlayers === 4;

  // Row = even player.num (0, 2), Column = odd player.num (1, 3) — matches Crib.tsx's dealerTeam logic
  const rowIndices = [0, 2];
  const columnIndices = [1, 3];

  const renderPlayerRow = (index: number) => {
    const name = playerNames[index];
    const color = PLAYER_COLORS[index];
    const isEditing = editingIndex === index;

    return (
      <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
        <span className={`w-4 h-4 rounded-full shrink-0 ${color.swatch}`} aria-hidden="true" />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              onBlur={() => handleBlur(index)}
              onKeyDown={(e) => e.key === "Enter" && handleBlur(index)}
              className={`w-full bg-transparent text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-0 rounded ${color.ring}`}
              maxLength={16}
              placeholder={`Player ${index + 1} name`}
            />
          ) : (
            <button
              onClick={() => setEditingIndex(index)}
              className="text-white font-semibold text-left w-full truncate hover:text-white/80 transition-colors"
            >
              {name}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Ready to Play</h2>
      <p className="text-white/60 text-sm text-center mb-6">Tap a name to customize it, or just start playing</p>

      {isTeamMode ? (
        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wide">Row</h3>
            {rowIndices.map(renderPlayerRow)}
          </div>
          <div className="space-y-3">
            <h3 className="text-fuchsia-400 text-sm font-bold uppercase tracking-wide">Column</h3>
            {columnIndices.map(renderPlayerRow)}
          </div>
        </div>
      ) : (
        <div className="space-y-3">{playerNames.map((_, index) => renderPlayerRow(index))}</div>
      )}

      <div className="space-y-3 pt-2">
        <button onClick={() => onSetPlayerNames(playerNames)} className="btn-menu btn-menu-primary">
          Start Game
        </button>
        <BackButton handler={onBack} />
      </div>
    </div>
  );
}
