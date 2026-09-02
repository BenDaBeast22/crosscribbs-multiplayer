import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { motion } from "framer-motion";

type ChildProps = {
  onSelect: (gameType: "local" | "online") => void;
  onBack: () => void;
};

export default function LocalOrOnline({ onSelect, onBack }: ChildProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Select Game Type</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <motion.button
          whileHover={{
            scale: 1.03,
            borderColor: "rgba(0, 245, 212, 0.6)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("local")}
          className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/2 border border-white/8 transition-colors duration-200 cursor-pointer text-center group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/4 flex items-center justify-center mb-4 group-hover:bg-[rgba(0,245,212,0.1)] transition-colors border border-white/5">
            <svg
              className="w-7 h-7 text-white opacity-80 group-hover:text-accent-1 group-hover:opacity-100 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <span className="font-bold text-lg text-white mb-1.5">Local Multiplayer</span>
          <span className="text-xs text-white/50 leading-relaxed px-2">
            Pass and play with friends on a single device
          </span>
        </motion.button>

        <motion.button
          whileHover={{
            scale: 1.03,
            borderColor: "rgba(0, 245, 212, 0.6)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/multiplayer-setup")}
          className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/2 border border-white/8 transition-colors duration-200 cursor-pointer text-center group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/4 flex items-center justify-center mb-4 group-hover:bg-[rgba(0,245,212,0.1)] transition-colors border border-white/5">
            <svg
              className="w-7 h-7 text-white opacity-80 group-hover:text-accent-1 group-hover:opacity-100 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>
          <span className="font-bold text-lg text-white mb-1.5">Online Multiplayer</span>
          <span className="text-xs text-white/50 leading-relaxed px-2">
            Create or join rooms to play online across devices
          </span>
        </motion.button>
      </div>
      <div className="sm:pt-4">
        <BackButton handler={onBack} />
      </div>
    </div>
  );
}
