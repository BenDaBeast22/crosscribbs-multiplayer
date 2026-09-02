import BackButton from "./BackButton";
import { motion } from "framer-motion";

type ChildProps = {
  onSelect: (onSelect: 2 | 4) => void;
  onBack: () => void;
};

export default function NumPlayers({ onSelect, onBack }: ChildProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Select Players</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <motion.button
          whileHover={{
            scale: 1.03,
            borderColor: "rgba(0, 245, 212, 0.6)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(2)}
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="font-bold text-lg text-white mb-1.5">1v1 Mode</span>
          <span className="text-xs text-white/50 leading-relaxed px-2">
            Head-to-head duel. Simple, competitive, fast
          </span>
        </motion.button>

        <motion.button
          whileHover={{
            scale: 1.03,
            borderColor: "rgba(0, 245, 212, 0.6)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(4)}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <span className="font-bold text-lg text-white mb-1.5">2v2 Mode</span>
          <span className="text-xs text-white/50 leading-relaxed px-2">
            Four-player team battle. Cooperate for the win
          </span>
        </motion.button>
      </div>
      <div className="sm:pt-4">
        <BackButton handler={onBack} />
      </div>
    </div>
  );
}
