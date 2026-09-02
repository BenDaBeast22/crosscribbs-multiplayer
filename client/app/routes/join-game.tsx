import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "~/connections/socket";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";
import { motion } from "framer-motion";

export default function JoinGame() {
  const navigate = useNavigate();
  const { joinLobby } = useLobby();
  const [username, setUsername] = useState("");
  const [lobbyId, setLobbyId] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoinGame = async () => {
    try {
      let playerId = localStorage.getItem("playerId");
      if (!playerId) {
        playerId = crypto.randomUUID(); // or any unique ID generator
        localStorage.setItem("playerId", playerId);
      }
      await joinLobby(lobbyId, username, playerId);
      navigate(`/lobby/${lobbyId}`);
    } catch (err: any) {
      alert(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-screen p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="text-center py-5"
      >
        <h1 className="text-5xl sm:text-6xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </motion.div>
      <div className="bg-panel panel-card card-max w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
          className="flex flex-col"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Join Game</h2>

          <div className="mb-5">
            <label htmlFor="username" className="block text-white text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full input-field"
              placeholder="e.g. CardPro"
            />
            {joinError && <p className="text-red-400 text-sm mt-2">{joinError}</p>}
          </div>

          <div className="mb-8">
            <label htmlFor="lobbyId" className="block text-white text-sm font-bold mb-2">
              Enter Game ID
            </label>
            <input
              type="text"
              id="lobbyId"
              value={lobbyId}
              onChange={(e) => setLobbyId(e.target.value)}
              maxLength={16}
              className="w-full input-field"
              placeholder="e.g. 1"
            />
            {joinError && <p className="text-red-400 text-sm mt-2">{joinError}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinGame}
              className="btn-menu btn-menu-primary"
            >
              Join Game
            </motion.button>
            <BackButton />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
