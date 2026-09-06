import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

type HostGameProps = {
  onBack: () => void;
};

export default function HostGame({ onBack }: HostGameProps) {
  const navigate = useNavigate();
  const { createLobby } = useLobby();
  const [username, setUsername] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<2 | 4>(2);
  const [gameMode, setGameMode] = useState<string>("standard");
  const [createdLobbyId, setCreatedLobbyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleHostGame = async () => {
    console.log("username: ", username);
    if (!username) {
      alert("Username cannot be empty");
      return;
    }
    try {
      let playerId = localStorage.getItem("playerId");
      if (!playerId) {
        playerId = crypto.randomUUID();
        localStorage.setItem("playerId", playerId);
      }
      const { lobbyId } = await createLobby(username, maxPlayers, playerId);
      console.log("HOST GAME: lobby id = ", lobbyId);
      setCreatedLobbyId(lobbyId);
    } catch (err: any) {
      console.log("error");
      alert(err);
    }
  };

  const handleCopyLobbyId = async () => {
    if (!createdLobbyId) return;
    try {
      await navigator.clipboard.writeText(createdLobbyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed silently — non-critical
    }
  };

  const handleContinueToLobby = () => {
    if (!createdLobbyId) return;
    navigate(`/lobby/${createdLobbyId}`);
  };

  return (
    <AnimatePresence mode="wait">
      {createdLobbyId ? (
        <motion.div
          key="created"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Lobby Created!</h2>
          <p className="text-white/60 text-sm mb-6">Share this code with your friends</p>

          <button
            onClick={handleCopyLobbyId}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 mb-6 transition-colors cursor-pointer"
            title="Copy lobby code"
          >
            <span className="text-3xl font-bold tracking-widest text-row">#{createdLobbyId}</span>
            {copied ? <Check size={22} className="text-emerald-400" /> : <Copy size={22} className="text-white/60" />}
          </button>

          <div className="w-full space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinueToLobby}
              className="btn-menu btn-menu-primary w-full"
            >
              Continue to Lobby
            </motion.button>
            <BackButton handler={() => setCreatedLobbyId(null)} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Host Game</h2>

          <div className="mb-5">
            <label htmlFor="username" className="block text-white text-sm font-bold mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={16}
              className="w-full input-field"
              placeholder="e.g. CardMaster"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="maxPlayers" className="block text-white text-sm font-bold mb-2">
              Max Players
            </label>
            <select
              id="maxPlayers"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value) as 2 | 4)}
              className="w-full input-field cursor-pointer"
            >
              <option value={2}>2 Players (1v1)</option>
              <option value={4}>4 Players (2v2)</option>
            </select>
          </div>

          <div className="mb-6 sm:mb-8">
            <label htmlFor="gameMode" className="block text-white text-sm font-bold mb-2">
              Game Mode
            </label>
            <select
              id="gameMode"
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full input-field cursor-pointer"
            >
              <option value="standard">Standard Cribbage</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleHostGame}
              className="btn-menu btn-menu-primary"
            >
              Host Game
            </motion.button>
            <BackButton handler={onBack} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
