import Board from "~/ui/Game/Board";
import Player from "~/ui/Game/Player.js";
import RoundScore from "~/ui/Game/RoundScore";
import GameOver from "~/ui/Game/GameOver";
import TurnIndicator from "~/ui/Game/TurnIndicator";
import RoundHistory from "~/ui/Game/RoundHistory";
import Crib from "~/ui/Game/Crib";
import Chat from "~/ui/Game/Chat";
import EmoteOverlay from "~/ui/Game/EmoteOverlay";
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
  let [numPlayers, setNumPlayers] = useState<number>(location.state?.numPlayers || 2);
  let [playerNames, setPlayerNames] = useState<string[]>(location.state?.playerNames || []);

  const [gameState, setGameState] = useState<GameStateType | null>(initialGameState || null);

  const [players, setPlayers] = useState<PlayerType[]>(initialGameState?.players || []);
  const playerId = localStorage.getItem("playerId");
  const [revealGameOver, setRevealGameOver] = useState(false);

  // Delays score reporting in Header until modal is dismissed
  const [displayedScores, setDisplayedScores] = useState<[number, number]>(initialGameState?.totalScores || [0, 0]);
  const isScoreVisibleRef = useRef(initialGameState?.roundScoreVisible || false);

  // Controls whether the popup modal is open on mobile viewports
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize refs to the CURRENT counts so a fresh page load / rejoin
  // doesn't fire sounds for cards that were already on the board.
  const prevBoardCountRef = useRef(gameState?.board.flat().filter(Boolean).length ?? 0);
  const prevCribLengthRef = useRef(gameState?.crib.length ?? 0);

  useEffect(() => {
    socket.emit("rejoinGame", { lobbyId, playerId });

    console.log("My player ID:", playerId);
    console.log("location.state: ", location.state);

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

  const currentPlayerName = players.find((p) => p.id === playerId)?.name || playerNames[gameState.turn] || "You";

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

  const discardToCrib = (lobbyId: string | undefined, numPlayers: number) => {
    const playerId = socket.id;
    const localPlayerId = localStorage.getItem("playerId");
    socket.emit("discardToCrib", { lobbyId, numPlayers, playerId, localPlayerId });
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
    base: "w-[50px] h-[70px] max-w-[60px] max-h-[84px] short:!w-[48px] short:!h-[67.2px] short:!max-w-[48px] short:!max-h-[67.2px]",
    sm: "md:w-[68px] md:h-[95px] md:max-w-[68px] md:max-h-[95px]",
    md: "lg:w-[74.8px] lg:h-[104.5px] lg:max-w-[93.6px] lg:max-h-[133.2px]",
    xl: "2xl:w-[93.6px] 2xl:h-[133.2px]",
  };

  return (
    <div className="bg-main-screen h-[100dvh] w-full flex flex-col overflow-hidden relative select-none">
      <Header
        totalScores={displayedScores}
        backToMenu={handleBackToMenu}
        turn={gameState.turn}
        paused={gameState.roundScoreVisible || gameState.gameOver}
        playerNames={playerNames}
        dealer={gameState.dealer}
      />

      {/* Floating emote animations render above everything, but never block clicks */}
      {isMultiplayer && <EmoteOverlay />}

      {/* FLOATING ACTION BUTTON: Displays strictly on screens narrower than desktop (`lg:hidden`) */}
      <button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed bottom-3 right-3 z-40 lg:hidden bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 px-4 rounded-full shadow-lg border border-slate-600 flex items-center gap-1.5 active:scale-95 transition-transform"
      >
        <span>📋</span> History
      </button>

      {/* Chat + emote picker — multiplayer only, bottom-left */}
      {isMultiplayer && (
        <Chat
          lobbyId={lobbyId}
          playerId={playerId ?? ""}
          playerName={currentPlayerName}
          isMultiplayer={isMultiplayer}
        />
      )}

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 w-full h-full flex flex-col lg:flex-row items-center justify-between md:p-2 gap-2 lg:gap-4 overflow-hidden">
        {/* Top / Left: Players Display */}
        <div className="w-full lg:w-1/4 flex flex-col items-center justify-center shrink-0 mb-1">
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

        {/* Center: Board Container - Constrained by dynamic aspect ratio and screen height */}
        <div className="flex-1 w-full max-w-[min(90vw,65vh)] aspect-square flex items-center justify-center">
          <Board
            board={gameState.board}
            lastMove={gameState.lastMove}
            playCard={playCard}
            turn={gameState.turn}
            cardSizes={cardSizes}
          />
        </div>

        {/* Bottom / Right: Crib & History */}
        <div className="w-full lg:w-1/4 flex flex-col items-center justify-center shrink-0 gap-3">
          <Crib
            crib={gameState.crib}
            dealer={gameState.dealer}
            cardSizes={cardSizes}
            players={gameState.players}
            turn={gameState.turn}
            playerId={socket.id}
            lobbyId={lobbyId}
            numPlayers={numPlayers}
            discardToCrib={discardToCrib}
          />

          {/* Inline history displays strictly on desktop (`lg:block`) */}
          <div className="hidden md:block w-full">
            <RoundHistory roundHistory={gameState.roundHistory} hideLatest={gameState.roundScoreVisible} />
          </div>
        </div>
      </div>

      {/* MOBILE / PORTRAIT TABLET POPUP DIALOG INTERFACE */}
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
          winner={gameState.totalScores[0] >= gameState.totalScores[1] ? "Row" : "Column"}
          totalScores={gameState.totalScores}
          resetGame={handleResetGame}
          roundHistory={gameState.roundHistory || []}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}
