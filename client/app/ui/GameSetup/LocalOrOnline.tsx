import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";

type ChildProps = {
  onSelect: (gameType: "local" | "online") => void;
  onBack: () => void;
};

export default function LocalOrOnline({ onSelect, onBack }: ChildProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Select Game Type</h2>
      <button
        onClick={() => onSelect("local")}
        className="btn-menu btn-menu-primary"
      >
        Local Multiplayer
      </button>
      <button
        onClick={() => navigate("/multiplayer-setup")}
        className="btn-menu btn-menu-secondary"
      >
        Online Multiplayer
      </button>
      <div className="pt-2">
        <BackButton handler={onBack} />
      </div>
    </div>
  );
}
