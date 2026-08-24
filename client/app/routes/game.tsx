import Board from "~/ui/Game/Board";
import Player from "~/ui/Game/Player.js";
import RoundScore from "~/ui/Game/RoundScore";
import GameOver from "~/ui/Game/GameOver";
import TurnIndicator from "~/ui/Game/TurnIndicator";
import RoundHistory from "~/ui/Game/RoundHistory";
import Crib from "~/ui/Game/Crib";
import { useEffect, useRef, useState } from "react";
import type { GameStateType, LobbyType } from "@cross-cribbs/shared-types/GameControllerTypes";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import { socket } from "../connections/socket";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PlayersDisplay from "~/ui/Game/PlayersDisplay";
import Header from "~/ui/Game/Header";
import { playCardPlaceSound, playDiscardSound } from "~/utils/sounds";

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lobbyId } = useParams();
  const { initialGameState } = location.state || {}; // get initial game state from lobby or menu
  //  NEW WAY (Keeps data safely in memory)
  const { gameType } = location.state || {};
  const [numPlayers, setNumPlayers] = useState<number>(location.state?.numPlayers || 2);
  const [playerNames, setPlayerNames] = useState<string[]>(location.state?.playerNames || []);

  const [gameState, setGameState] = useState<GameStateType | null>(initialGameState || null);

  const [players, setPlayers] = useState<PlayerType[]>(initialGameState?.players || []);
  const playerId = localStorage.getItem("playerId");
  const [revealGameOver, setRevealGameOver] = useState(false);

  // Delays score reporting in Header until modal is dismissed
  const [displayedScores, setDisplayedScores] = useState<[number, number]>(initialGameState?.totalScores || [0, 0]);
  const isScoreVisibleRef = useRef(initialGameState?.roundScoreVisible || false);

  // NEW STATE: Controls whether the popup modal is open on mobile viewports
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize refs to the CURRENT counts so a fresh page load / rejoin
  // doesn't fire sounds for cards that were already on the board.
  const prevBoardCountRef = useRef(gameState?.board.flat().filter(Boolean).length ?? 0);
  const prevCribLengthRef = useRef(gameState?.crib.length ?? 0);

  useEffect(() => {
    socket.emit("rejoinGame", { lobbyId, playerId });

    console.log("My player ID:", playerId);
    console.log("location.state: ", location.state);

    //  NEW WAY
    const handleGameUpdate = (state: GameStateType) => {
      console.log("Game state updated", state);
      setGameState(state);
      setPlayers(state.players);

      // Sync multiplayer lobby updates directly to state so they don't break on game over
      if (state.lobby) {
        setNumPlayers(state.lobby.numPlayers);
        setPlayerNames(state.lobby.players.map((p) => p.name));
      }

      // If the summary screen is NOT open, update the header scores continuously
      if (!state.roundScoreVisible) {
        setDisplayedScores(state.totalScores);
      }

      isScoreVisibleRef.current = state.roundScoreVisible;
    };

    socket.on("gameStateUpdate", handleGameUpdate);

    return () => {
      socket.off("gameStateUpdate", handleGameUpdate);
    };
  }, []);

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  //for sounds
  useEffect(() => {
    const currentBoardCount = gameState.board.flat().filter(Boolean).length;
    if (currentBoardCount > prevBoardCountRef.current) {
      playCardPlaceSound();
    }
    prevBoardCountRef.current = currentBoardCount;
  }, [gameState.board]);

  useEffect(() => {
    const currentCribLength = gameState.crib.length;
    if (currentCribLength > prevCribLengthRef.current) {
      playDiscardSound();
    }
    prevCribLengthRef.current = currentCribLength;
  }, [gameState.crib]);

  // Reset whenever gameOver goes false — covers starting a fresh game after resetGame()
  useEffect(() => {
    if (!gameState.gameOver) {
      setRevealGameOver(false);
      setDisplayedScores(gameState.totalScores);
    }
  }, [gameState.gameOver]);

  let isMultiplayer = false;
  if (gameState.lobby) {
    numPlayers = gameState.lobby.numPlayers;
    playerNames = gameState.lobby.players.map((p) => p.name);
    isMultiplayer = true;
  }

  console.log("playerNames = ", playerNames);

  const handleResetGame = () => {
    const payload = { lobbyId: isMultiplayer ? lobbyId : undefined, playerId };
    socket.emit("resetGame", payload);
  };

  const handleBackToMenu = () => {
    handleResetGame();
    navigate("/");
  };

  const handleRoundScoreNext = () => {
    // Fallback protection: ensure scores are aligned if someone skips or proceeds fast
    setDisplayedScores(gameState.totalScores);

    if (gameState.gameOver) {
      setRevealGameOver(true);
    } else {
      nextRound();
    }
  };

  const playCard = (pos: BoardPosition, turn: number) => {
    if (isMultiplayer) {
      const playerId = socket.id;
      socket.emit("playCard", { lobbyId, pos, playerId });
    } else {
      socket.emit("playCard", { pos, playerId });
    }
  };

  const nextRound = () => {
    console.log("isMultiplayer = ", isMultiplayer);
    if (isMultiplayer) {
      socket.emit("nextRound", { lobbyId });
    } else {
      socket.emit("nextRound", { playerId });
    }
  };

  const cardSizes = {
    base: "w-[60px] h-[84px] max-w-[60px] max-h-[84px] short:!w-[48px] short:!h-[67.2px] short:!max-w-[48px] short:!max-h-[67.2px]",
    sm: "md:w-[68px] md:h-[95px] md:max-w-[68px] md:max-h-[95px]",
    md: "lg:w-[81.9px] lg:h-[116.55px] lg:max-w-[93.6px] lg:max-h-[133.2px]",
    xl: "2xl:w-[93.6px] 2xl:h-[133.2px]",
  };

  return (
    <div className="bg-main-screen min-h-screen w-full flex flex-col overflow-y-auto relative">
      <Header
        totalScores={displayedScores}
        backToMenu={handleBackToMenu}
        turn={gameState.turn}
        paused={gameState.roundScoreVisible || gameState.gameOver}
        playerNames={playerNames}
        dealer={gameState.dealer}
      />

      {/* FLOATING ACTION BUTTON: Displays strictly on mobile layout screens (`lg:hidden`) */}
      <button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed bottom-3 right-3 z-40 md:hidden bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 px-4 rounded-full shadow-lg border border-slate-600 flex items-center gap-1.5 active:scale-95 transition-transform"
      >
        <span>📋</span> History
      </button>

      <div className="flex-1 flex flex-col md:flex-row short:flex-row relative items-center justify-center gap-0 md:gap-5 lg:gap-0 short:gap-2 2xl:gap-7">
        <div className="w-full md:w-2/10 lg:w-1/3">
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-10 mb-2 md:mb-0">
              <PlayersDisplay
                lobbyId={lobbyId}
                numPlayers={numPlayers}
                playerNames={playerNames}
                players={players}
                turn={gameState.turn}
                crib={gameState.crib}
                cardSizes={cardSizes}
              />
            </div>
          </div>
        </div>
        <div className="w-full md:5/10 lg:w-1/3">
          <Board
            board={gameState.board}
            lastMove={gameState.lastMove}
            playCard={playCard}
            turn={gameState.turn}
            cardSizes={cardSizes}
          />
        </div>
        <div className="w-full md:w-3/10 lg:w-1/3">
          <div className="flex justify-center">
            <div className="inline-flex flex-col items-center gap-10">
              <Crib crib={gameState.crib} dealer={gameState.dealer} cardSizes={cardSizes} />

              {/* DESKTOP NATIVE VIEW: Hides standard list container on mobile */}
              <div className="hidden md:block w-full">
                <RoundHistory roundHistory={gameState.roundHistory} hideLatest={gameState.roundScoreVisible} />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE POPUP DIALOG INTERFACE */}
        {isHistoryOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:hidden">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative flex flex-col max-h-[75vh]">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span>📋</span> Round History
                </h3>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto flex-1 flex justify-center pb-2">
                <RoundHistory roundHistory={gameState.roundHistory} hideLatest={gameState.roundScoreVisible} />
              </div>
            </div>
          </div>
        )}

        {gameState.roundScoreVisible && !revealGameOver && (
          <RoundScore
            nextRound={handleRoundScoreNext}
            roundScores={gameState.roundScores}
            lineScores={gameState.lineScores}
            totalScores={gameState.totalScores}
            cribScore={gameState.cribScore}
            dealer={gameState.dealer}
            crib={gameState.crib}
            board={gameState.board}
            heels={gameState.heels}
            cardSizes={cardSizes}
            isFinalRound={gameState.gameOver}
            onAnimationComplete={() => {
              setDisplayedScores(gameState.totalScores);
            }}
          />
        )}

        {gameState.gameOver && revealGameOver && (
          <GameOver
            winner={gameState.totalScores[0] >= gameState.totalScores[1] ? "Row" : "Column"} // 👈 Pass winner string
            totalScores={gameState.totalScores}
            resetGame={handleResetGame}
            roundHistory={gameState.roundHistory || []} // 👈 Added missing roundHistory prop with a fallback array
            onBackToMenu={handleBackToMenu} // 👈 Fixed back to menu callback prop name
          />
        )}
      </div>
    </div>
  );
}
