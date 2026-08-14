import { useEffect, useState } from "react";
import LocalOrOnline from "~/ui/GameSetup/LocalOrOnline";
import NumPlayers from "~/ui/GameSetup/NumPlayers";
import PlayerSetup from "~/ui/GameSetup/PlayerSetup";
import { useNavigate } from "react-router-dom";
import { socket } from "~/connections/socket";
import type { GameStateType } from "@cross-cribbs/shared-types/GameControllerTypes";
import { AnimatePresence, motion } from "framer-motion";

type SetupPage = "gameType" | "numPlayers" | "playerSetup";
const pageOrder: SetupPage[] = ["gameType", "numPlayers", "playerSetup"];

export default function GameSetup() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<SetupPage>("gameType");
  const [gameType, setGameType] = useState<"local" | "online" | null>(null);
  const [numPlayers, setNumPlayers] = useState<2 | 4>(2);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  let playerId = localStorage.getItem("playerId");
  if (!playerId) {
    playerId = crypto.randomUUID(); // or any unique ID generator
    localStorage.setItem("playerId", playerId);
  }

  useEffect(() => {
    socket.on("gameStateUpdate", (gameState: GameStateType) => {
      // This means the game has started
      console.log("Game started, navigating to game page.", gameState);
      console.log(
        `gamestate = ${gameState} gameType = ${gameType} numPlayers=${numPlayers} playerNames=${playerNames}`,
      );
      navigate("/game", { state: { initialGameState: gameState, gameType, numPlayers, playerNames } });
    });

    return () => {
      socket.off("gameStateUpdate");
    };
  }, [navigate, numPlayers, playerNames]);

  const goToNextPage = (next: SetupPage) => setCurrentPage(next);
  const goBack = () => {
    const currentIndex = pageOrder.indexOf(currentPage);
    if (currentIndex > 0) {
      setCurrentPage(pageOrder[currentIndex - 1]);
    } else if (currentIndex === 0) {
      navigate("/");
    }
  };
  const setLocalSettings = () => {
    socket.emit("setLocalSettings", gameType, numPlayers, playerNames);
  };

  const handleSetPlayerNames = (playerNames: string[]) => {
    setPlayerNames(playerNames);
    socket.emit("startGame", { numPlayers, playerId });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-screen p-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="text-center pt-16 pb-15"
      >
        <h1 className="text-6xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </motion.div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
        className="bg-panel panel-card card-max flex flex-col overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {currentPage === "gameType" && (
            <motion.div
              key="gameType"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LocalOrOnline
                onSelect={(type) => {
                  setGameType(type);
                  goToNextPage("numPlayers");
                }}
                onBack={goBack}
              />
            </motion.div>
          )}
          {currentPage === "numPlayers" && (
            <motion.div
              key="numPlayers"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <NumPlayers
                onSelect={(numPlayers) => {
                  console.log("numpipiPlayers = ", numPlayers);
                  setNumPlayers(numPlayers);
                  goToNextPage("playerSetup");
                }}
                onBack={goBack}
              />
            </motion.div>
          )}
          {currentPage === "playerSetup" && (
            <motion.div
              key="playerSetup"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PlayerSetup numPlayers={numPlayers} onSetPlayerNames={handleSetPlayerNames} onBack={goBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

