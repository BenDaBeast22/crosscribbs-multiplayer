import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";
import { motion } from "framer-motion";

type JoinGameProps = {
  onBack: () => void;
};

export default function JoinGame({ onBack }: JoinGameProps) {
  const navigate = useNavigate();
  const { joinLobby } = useLobby();
  const [username, setUsername] = useState("");
  const [lobbyId, setLobbyId] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoinGame = async () => {
    try {
      let playerId = localStorage.getItem("playerId");
      if (!playerId) {
        playerId = crypto.randomUUID();
        localStorage.setItem("playerId", playerId);
      }
      const res = await joinLobby(lobbyId, username, playerId);
      if (res.spectator) {
        navigate(`/game/${lobbyId}`);
      } else {
        navigate(`/lobby/${lobbyId}`);
      }
    } catch (err: any) {
      alert(err);
    }
  };

  return (
    <div className="flex flex-col">
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
          placeholder="e.g. 5WVTN"
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
        <BackButton handler={onBack} />
      </div>
    </div>
  );
}
