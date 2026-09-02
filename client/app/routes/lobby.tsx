import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { socket } from "~/connections/socket";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="text-center py-5 sm:py-12"
      >
        <h1 className="text-5xl sm:text-6xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </motion.div>
      <div className="bg-panel panel-card card-max w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold panel-heading mb-6 text-center">Game Lobby</h2>
          <div className="space-y-2 mb-6">
            <p className="text-white text-lg flex justify-between">
              <span className="opacity-80">Lobby ID:</span>
              <span className="font-bold text-row">{lobbyId}</span>
            </p>
            <p className="text-white text-lg flex justify-between">
              <span className="opacity-80">Players Joined:</span>
              <span className="font-bold">
                {lobby.players.length} / {lobby.numPlayers}
              </span>
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {lobby.players.map((player: any) => (
              <motion.div
                layout
                key={player.playerId}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-base">{player.name}</span>
                  {player.playerId === lobby.host && (
                    <span className="badge-host px-2 py-0.5 rounded-full text-[10px]">Host</span>
                  )}
                  {player.playerId === playerId && (
                    <span className="badge-you px-2 py-0.5 rounded-full text-[10px]">You</span>
                  )}
                </div>
                {player.disconnected && (
                  <span className="text-xs text-red-400 font-medium">
                    Disconnected ({remainingDisconnect(player)}s)
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {lobby.host && (
            <motion.button
              whileHover={canStartGame ? { scale: 1.02 } : {}}
              whileTap={canStartGame ? { scale: 0.98 } : {}}
              onClick={handleStartGame}
              disabled={!canStartGame}
              className={`w-full btn-menu btn-menu-primary mb-4`}
            >
              Start Game
            </motion.button>
          )}

          <BackButton />
        </motion.div>
      </div>
    </div>
  );
}
