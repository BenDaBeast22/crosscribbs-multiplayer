import BackButton from "./BackButton";
import { motion } from "framer-motion";

type OnlineMenuProps = {
  onSelectHost: () => void;
  onSelectJoin: () => void;
  onBack: () => void;
};

export default function OnlineMenu({ onSelectHost, onSelectJoin, onBack }: OnlineMenuProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Online Multiplayer</h2>
      <div className="space-y-5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectHost}
          className="btn-menu btn-menu-primary"
        >
          Host Game
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectJoin}
          className="btn-menu btn-menu-secondary"
        >
          Join Game
        </motion.button>
        <div>
          <BackButton handler={onBack} />
        </div>
      </div>
    </div>
  );
}
