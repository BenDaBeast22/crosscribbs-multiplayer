import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";
import { motion } from "framer-motion";

export default function HostGame() {
  const navigate = useNavigate();
  const { createLobby } = useLobby();
  const [username, setUsername] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<2 | 4>(2);
  const [gameMode, setGameMode] = useState<string>("standard"); // Default game mode

  const handleHostGame = async () => {
    console.log("username: ", username);
    if (!username) {
      alert("Username cannot be empty");
      return;
    }
    try {
      let playerId = localStorage.getItem("playerId");
      if (!playerId) {
        playerId = crypto.randomUUID(); // or any unique ID generator
        localStorage.setItem("playerId", playerId);
      }
      const { lobbyId } = await createLobby(username, maxPlayers, playerId);
      console.log("HOST GAME: lobby id = ", lobbyId);
      navigate(`/lobby/${lobbyId}`);
    } catch (err: any) {
      console.log("error");
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
            <BackButton />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
