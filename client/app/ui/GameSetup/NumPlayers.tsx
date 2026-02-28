import BackButton from "./BackButton";

type ChildProps = {
  onSelect: (onSelect: 2 | 4) => void;
  onBack: () => void;
};

export default function NumPlayers({ onSelect, onBack }: ChildProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Select Game Mode</h2>
      <button
        onClick={() => onSelect(2)}
        className="btn-menu btn-menu-primary"
      >
        1v1
      </button>
      <button
        onClick={() => onSelect(4)}
        className="btn-menu btn-menu-secondary"
      >
        2v2
      </button>
      <div className="pt-2">
        <BackButton handler={onBack} />
      </div>
    </div>
  );
}
