import { useEffect, useState } from "react";
import LocalOrOnline from "~/ui/GameSetup/LocalOrOnline";
import NumPlayers from "~/ui/GameSetup/NumPlayers";
import PlayerSetup from "~/ui/GameSetup/PlayerSetup";
import OnlineMenu from "~/ui/GameSetup/OnlineMenu";
import HostGame from "~/ui/GameSetup/HostGame";
import JoinGame from "~/ui/GameSetup/JoinGame";
import { useNavigate } from "react-router-dom";
import { socket } from "~/connections/socket";
import type { GameStateType } from "@cross-cribbs/shared-types/GameControllerTypes";
import { AnimatePresence, motion } from "framer-motion";

export type SetupPage = "gameType" | "numPlayers" | "playerSetup" | "onlineMenu" | "hostGame" | "joinGame";

type MenuProps = {
  initialPage?: SetupPage;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
  }),
};

export default function GameSetup({ initialPage = "gameType" }: MenuProps) {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SetupPage[]>(() => {
    if (initialPage === "hostGame" || initialPage === "joinGame") {
      return ["gameType", "onlineMenu", initialPage];
    }
    if (initialPage === "onlineMenu") {
      return ["gameType", "onlineMenu"];
    }
    return [initialPage];
  });
  const [direction, setDirection] = useState<number>(1);
  const [gameType, setGameType] = useState<"local" | "online" | null>(null);
  const [numPlayers, setNumPlayers] = useState<2 | 4>(2);
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  const currentPage = history[history.length - 1];

  let playerId = localStorage.getItem("playerId");
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
  }

  useEffect(() => {
    socket.on("gameStateUpdate", (gameState: GameStateType) => {
      console.log("Game started, navigating to game page.", gameState);
      console.log(
        `gamestate = ${gameState} gameType = ${gameType} numPlayers=${numPlayers} playerNames=${playerNames}`,
      );
      navigate("/game", { state: { initialGameState: gameState, gameType, numPlayers, playerNames } });
    });

    return () => {
      socket.off("gameStateUpdate");
    };
  }, [navigate, numPlayers, playerNames, gameType]);

  const goToPage = (next: SetupPage) => {
    setDirection(1);
    setHistory((prev) => [...prev, next]);
  };

  const goBack = () => {
    if (history.length > 1) {
      setDirection(-1);
      setHistory((prev) => prev.slice(0, -1));
    } else {
      navigate("/");
    }
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
        className="text-center py-5"
      >
        <h1 className="text-5xl sm:text-6xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </motion.div>

      {/* Blur lives here, on a plain div that NEVER animates */}
      <div className="bg-panel panel-card card-max overflow-hidden">
        {/* Entrance pop-in — animates on entry, but carries no blur of its own */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
          className="flex flex-col"
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {currentPage === "gameType" && (
                <LocalOrOnline
                  onSelect={(type) => {
                    setGameType(type);
                    if (type === "local") {
                      goToPage("numPlayers");
                    } else {
                      goToPage("onlineMenu");
                    }
                  }}
                  onBack={goBack}
                />
              )}
              {currentPage === "numPlayers" && (
                <NumPlayers
                  onSelect={(selectedNumPlayers) => {
                    setNumPlayers(selectedNumPlayers);
                    goToPage("playerSetup");
                  }}
                  onBack={goBack}
                />
              )}
              {currentPage === "playerSetup" && (
                <PlayerSetup
                  numPlayers={numPlayers}
                  onSetPlayerNames={handleSetPlayerNames}
                  onBack={goBack}
                />
              )}
              {currentPage === "onlineMenu" && (
                <OnlineMenu
                  onSelectHost={() => goToPage("hostGame")}
                  onSelectJoin={() => goToPage("joinGame")}
                  onBack={goBack}
                />
              )}
              {currentPage === "hostGame" && (
                <HostGame onBack={goBack} />
              )}
              {currentPage === "joinGame" && (
                <JoinGame onBack={goBack} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
