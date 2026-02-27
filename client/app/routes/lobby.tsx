import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { socket } from "~/connections/socket";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";

interface PlayerInfo {
  id: string;
  name: string;
}

export default function Lobby() {
  const navigate = useNavigate();
  const { lobbyId } = useParams();
  console.log("lobbyId = ", lobbyId);
  const { lobby, gameStarted, startGame } = useLobby(lobbyId);

  const playerId = localStorage.getItem("playerId");
  useEffect(() => {
    if (!lobbyId) {
      console.log("LOBBY: lobby id = ", lobbyId);
      navigate("/multiplayer-setup");
    }
    if (playerId) {
      socket.emit("rejoinLobby", { lobbyId, playerId });
    }

    socket.on("gameStateUpdate", (gameState) => {
      // This means the game has started
      console.log("Game started, navigating to game page.", gameState);
      navigate(`/game/${lobbyId}`, { state: { lobbyId, initialGameState: gameState } });
    });

    return () => {
      socket.off("gameStateUpdate");
    };
  }, [lobbyId, navigate]);

  if (!lobby) return <div>Loading lobby...</div>;

  const numPlayers = lobby.numPlayers;
  const isHost = lobby.host === playerId;
  console.log("lobby host = ", lobby.host);
  console.log("playerId = ", playerId);
  const canStartGame = lobby.players.length === numPlayers && isHost;

  const remainingDisconnect = (player: PlayerType) => {
    return player.disconnectExpiresAt ? Math.max(0, Math.ceil((player.disconnectExpiresAt - Date.now()) / 1000)) : null;
  };

  console.log(`lobby.players.len = ${lobby.players.length} === lobby.numPlayers = ${lobby.numPlayers}`);

  const handleStartGame = () => {
    if (canStartGame) {
      socket.emit("startGame", { lobbyId, numPlayers });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-screen p-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-2 title-gradient">Cross Cribbs</h1>
      </div>
      <div className="bg-panel panel-card card-max">
        <h2 className="text-2xl font-bold panel-heading mb-6 text-center">Game Lobby</h2>
        <p className="text-white text-lg mb-4">
          Lobby ID: <span className="font-bold text-row">{lobbyId}</span>
        </p>
        {/* <p className="text-white text-lg mb-4">
          Game Mode: <span className="font-bold text-cyan-300">{gameMode}</span>
        </p> */}
        <p className="text-white text-lg mb-4">
          Players: {lobby.players.length} / {lobby.numPlayers}
        </p>
        <ul className="list-disc list-inside text-white mb-6">
          {lobby.players.map((player: any) => (
            <li key={player.playerId}>
              {/* {player.name} {lobby.host === player.id ? "(Host)" : ""} */}
              {player.name}
              {player.playerId === lobby.host && (
                <span className="badge-host px-2 rounded-full text-xs ml-2">Host</span>
              )}
              {console.log(`playerId = ${playerId} player.id=${player.id}`)}
              {player.playerId === playerId && <span className="badge-you px-2 rounded-full text-xs ml-2">You</span>}
              {player.disconnected && (
                <span className="ml-2 text-red-400">Disconnected ({remainingDisconnect(player)}s)</span>
              )}
            </li>
          ))}
        </ul>

        {lobby.host && (
          <button
            onClick={handleStartGame}
            disabled={!canStartGame}
            className={`w-full font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 mb-4 ${
              canStartGame ? "btn-primary hover:opacity-95" : "bg-gray-500 opacity-50 cursor-not-allowed"
            }`}
          >
            Start Game
          </button>
        )}

        <BackButton />
      </div>
    </div>
  );
}
