import { useState } from "react";
import BackButton from "./BackButton";

type ChildProps = {
  numPlayers: 2 | 4;
  onSetPlayerNames: (playerNames: string[]) => void;
  onBack: () => void;
};

export default function PlayerSetup({ numPlayers, onSetPlayerNames, onBack }: ChildProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(() => Array.from({ length: numPlayers }, () => ""));

  const handleNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const allNamesEntered = playerNames.every((name) => name.trim() !== "");

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Enter Player Names</h2>
      <div className="space-y-5">
        {playerNames.map((name, index) => (
          <div key={index}>
            <label className="block text-white text-sm font-bold mb-2" htmlFor={`player${index + 1}`}>
              Player {index + 1}
            </label>
            <input
              type="text"
              id={`player${index + 1}`}
              value={name.toString()}
              onChange={(e) => handleNameChange(index, e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100" style={{"--tw-ring-color": "#F3A712"} as React.CSSProperties}
              placeholder={`Player ${index + 1} name`}
            />
          </div>
        ))}
      </div>
      <div className="space-y-3 pt-2">
        <button
          onClick={() => onSetPlayerNames(playerNames)}
          disabled={!allNamesEntered}
          className={`btn-menu ${
            allNamesEntered
              ? "btn-menu-primary"
              : "opacity-50 cursor-not-allowed bg-gray-400 text-gray-600"
          }`}
        >
          Start Game
        </button>
      </div>
      <BackButton handler={onBack} />
    </div>
  );
}
