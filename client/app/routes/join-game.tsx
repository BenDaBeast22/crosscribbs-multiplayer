import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "~/connections/socket";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";

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
    <div className="flex flex-col items-center min-h-screen bg-main-screen p-4">
      <div className="text-center pt-16 pb-15">
        <h1 className="text-6xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </div>
      <div className="bg-panel panel-card card-max flex flex-col">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Join Game</h2>

        <div className="mb-4">
          <label htmlFor="username" className="block text-white text-lg font-bold mb-2">
            Username:
          </label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full input-field" placeholder="i.e BillyTheKid" />
          {joinError && <p className="text-red-400 text-sm mt-2">{joinError}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="gameId" className="block text-white text-lg font-bold mb-2">
            Enter Game ID:
          </label>
          <input type="text" id="lobbyId" value={lobbyId} onChange={(e) => setLobbyId(e.target.value)} className="w-full input-field" placeholder="i.e 2" />
          {joinError && <p className="text-red-400 text-sm mt-2">{joinError}</p>}
        </div>

        <div className="space-y-3 pt-2">
          <button onClick={handleJoinGame} className="btn-menu btn-menu-primary">
            Join Game
          </button>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
