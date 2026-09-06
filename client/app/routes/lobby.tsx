import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "~/connections/socket";
import { useLobby } from "~/hooks/useLobby";
import BackButton from "~/ui/GameSetup/BackButton";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

export default function Lobby() {
  const navigate = useNavigate();
  const { lobbyId } = useParams();
  const { lobby, gameStarted, startGame } = useLobby(lobbyId);

  const playerId = localStorage.getItem("playerId");

  useEffect(() => {
    if (!lobbyId) {
      navigate("/multiplayer-setup");
    }
    if (playerId) {
      socket.emit("rejoinLobby", { lobbyId, playerId });
    }

    socket.on("gameStateUpdate", (gameState) => {
      navigate(`/game/${lobbyId}`, { state: { lobbyId, initialGameState: gameState } });
    });

    return () => {
      socket.off("gameStateUpdate");
    };
  }, [lobbyId, navigate]);

  if (!lobby) return <div>Loading lobby...</div>;

  const numPlayers = lobby.numPlayers;
  const isHost = lobby.host === playerId;
  const isTeamMode = numPlayers === 4;

  const rowPlayers = lobby.players.filter((p: any) => p.team === "Row");
  const columnPlayers = lobby.players.filter((p: any) => p.team === "Column");
  const teamsBalanced = !isTeamMode || (rowPlayers.length === 2 && columnPlayers.length === 2);

  const canStartGame = lobby.players.length === numPlayers && isHost && teamsBalanced;

  const remainingDisconnect = (player: PlayerType) => {
    return player.disconnectExpiresAt ? Math.max(0, Math.ceil((player.disconnectExpiresAt - Date.now()) / 1000)) : null;
  };

  const handleStartGame = () => {
    if (canStartGame) {
      socket.emit("startGame", { lobbyId, numPlayers, playerId });
    }
  };

  const handleSwitchTeam = () => {
    socket.emit("switchTeam", { lobbyId, playerId });
  };

  const renderPlayerRow = (player: any) => {
    const isYou = player.playerId === playerId;

    return (
      <motion.div
        layout
        key={player.playerId}
        className="flex items-center justify-between min-h-[34px] lg:min-h-0 px-2 py-1.5 lg:p-3.5 rounded-xl bg-white/5 border border-white/5"
      >
        <div className="flex items-center gap-2">
          <span className={`text-white text-xs lg:text-base ${isYou ? "italic font-extrabold" : "font-semibold"}`}>
            {player.name}
          </span>
          {player.playerId === lobby.host && (
            <span className="badge-host px-0.5 lg:px-2 lg:py-0.5 rounded-full text-[10px]">
              <span className="lg:hidden">H</span>
              <span className="hidden lg:inline">Host</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {player.disconnected && (
            <span className="text-xs text-red-400 font-medium">Disconnected ({remainingDisconnect(player)}s)</span>
          )}
          {isTeamMode && isYou && (
            <div className="relative group">
              <button
                onClick={handleSwitchTeam}
                className="p-0.5 lg:p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Switch team"
              >
                <ArrowLeftRight size={14} />
              </button>
              <span className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Switch team
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
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

          {/*
            Same Row/Column grid layout for both 1v1 and 2v2 — only the
            switch-team button (isTeamMode-gated inside renderPlayerRow)
            and the "needs 2 per team" notice below differ between modes.
          */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wide text-center mb-2">
                Row {isTeamMode && rowPlayers.length !== 2 ? `(${rowPlayers.length}/2)` : ""}
              </h3>
              <div className="space-y-2">{rowPlayers.map(renderPlayerRow)}</div>
            </div>
            <div>
              <h3 className="text-fuchsia-400 text-sm font-bold uppercase tracking-wide text-center mb-2">
                Column {isTeamMode && columnPlayers.length !== 2 ? `(${columnPlayers.length}/2)` : ""}
              </h3>
              <div className="space-y-2">{columnPlayers.map(renderPlayerRow)}</div>
            </div>
          </div>

          {!teamsBalanced && isTeamMode && (
            <p className="text-amber-400 text-xs text-center mb-3">Each team needs exactly 2 players to start.</p>
          )}

          {lobby.host && (
            <motion.button
              whileHover={canStartGame ? { scale: 1.02 } : {}}
              whileTap={canStartGame ? { scale: 0.98 } : {}}
              onClick={handleStartGame}
              disabled={!canStartGame}
              className="w-full btn-menu btn-menu-primary mb-4"
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
