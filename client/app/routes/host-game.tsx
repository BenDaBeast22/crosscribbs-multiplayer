import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";

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
    // socket.emit("startGame", { lobbyId, maxPlayers, gameMode });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-main-screen p-4">
      <div className="text-center pt-16 pb-15">
        <h1 className="text-6xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </div>
      <div className="bg-panel panel-card card-max flex flex-col">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Host Game</h2>

        <div className="mb-4">
          <label htmlFor="username" className="block text-white text-lg font-bold mb-2">
            Username:
          </label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full input-field"></input>
        </div>

        <div className="mb-4">
          <label htmlFor="maxPlayers" className="block text-white text-lg font-bold mb-2">
            Max Players:
          </label>
          <select id="maxPlayers" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value) as 2 | 4)} className="w-full input-field">
            <option value={2}>2 Players</option>
            <option value={4}>4 Players</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="gameMode" className="block text-white text-lg font-bold mb-2">
            Game Mode:
          </label>
          <select id="gameMode" value={gameMode} onChange={(e) => setGameMode(e.target.value)} className="w-full input-field">
            <option value="standard">Standard Cribbage</option>
            {/* Add other game modes here */}
          </select>
        </div>

        <div className="space-y-3 pt-2">
          <button onClick={handleHostGame} className="btn-menu btn-menu-primary">
            Host Game
          </button>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
