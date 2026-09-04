import Board from "~/ui/Game/Board";
import Player from "~/ui/Game/Player.js";
import RoundScore from "~/ui/Game/RoundScore";
import GameOver from "~/ui/Game/GameOver";
import TurnIndicator from "~/ui/Game/TurnIndicator";
import RoundHistory from "~/ui/Game/RoundHistory";
import Crib from "~/ui/Game/Crib";
import Chat from "~/ui/Game/Chat";
import EmoteOverlay from "~/ui/Game/EmoteOverlay";
import RoundStartPopup from "~/ui/Game/RoundStartPopup";
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
  const { initialGameState } = location.state || {};

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

  // Controls the round-start / dealer-and-first-player popup
  const [showRoundStart, setShowRoundStart] = useState(false);
  const prevDealerRef = useRef<number | null | undefined>(undefined);

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

  useEffect(() => {
    const currentBoardCount = gameState?.board.flat().filter(Boolean).length ?? 0;

    if (gameState && currentBoardCount > prevBoardCountRef.current) {
      playCardPlaceSound();
    }

    prevBoardCountRef.current = currentBoardCount;
  }, [gameState?.board]);

  useEffect(() => {
    const currentCribLength = gameState?.crib.length ?? 0;

    if (gameState && currentCribLength > prevCribLengthRef.current) {
      playDiscardSound();
    }

    prevCribLengthRef.current = currentCribLength;
  }, [gameState?.crib]);

  useEffect(() => {
    if (!gameState) return;

    if (!gameState.gameOver) {
      setRevealGameOver(false);
      setDisplayedScores(gameState.totalScores);
    }
  }, [gameState?.gameOver]);

  // Show the round-start popup whenever the dealer changes (new round), as long as
  // we're not mid round-score-summary or game-over (those overlays take priority)
  useEffect(() => {
    if (!gameState || gameState.gameOver || gameState.roundScoreVisible) return;

    if (prevDealerRef.current !== gameState.dealer) {
      prevDealerRef.current = gameState.dealer;
      setShowRoundStart(true);
    }
  }, [gameState?.dealer, gameState?.roundScoreVisible, gameState?.gameOver]);

  // NOW it's safe to conditionally return
  if (!gameState) {
    return <div>Loading game...</div>;
  }

  let isMultiplayer = false;

  if (gameState.lobby) {
    numPlayers = gameState.lobby.numPlayers;
    playerNames = gameState.lobby.players.map((p) => p.name);
    isMultiplayer = true;
  }

  console.log("playerNames = ", playerNames);

  const currentPlayerName = players.find((p) => p.id === playerId)?.name || playerNames[gameState.turn] || "You";
  const isFirstRound = (gameState.roundHistory?.length ?? 0) === 0;

  const handleResetGame = () => {
    const payload = {
      lobbyId: isMultiplayer ? lobbyId : undefined,
      playerId,
    };

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

    socket.emit("discardToCrib", {
      lobbyId,
      numPlayers,
      playerId,
      localPlayerId,
    });
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
    <div className="bg-main-screen min-h-[100dvh] w-full flex flex-col relative select-none">
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

      {/* Round-start popup: shows dealer, who goes first, and score. Coin flip on round 1 */}
      <RoundStartPopup
        isOpen={showRoundStart}
        onDismiss={() => setShowRoundStart(false)}
        dealer={gameState.dealer}
        numPlayers={numPlayers}
        playerNames={playerNames}
        totalScores={displayedScores}
        isFirstRound={isFirstRound}
      />

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
      <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-evenly lg:flex-row lg:justify-around lg:gap-0 lg:py-2 mx-auto md:p-2">
        {/* Left: Players Display — fixed 1/4 width on lg+ */}
        <div className="w-full lg:w-1/4 flex flex-col items-center justify-center mb-1 lg:mb-0">
          <PlayersDisplay
            lobbyId={lobbyId}
            numPlayers={numPlayers}
            playerNames={playerNames}
            players={players}
            turn={gameState.turn}
            crib={gameState.crib}
            dealer={gameState.dealer}
          />
        </div>

        {/* Center: Board */}
        <div className="shrink-0 flex items-center justify-center">
          <Board
            board={gameState.board}
            lastMove={gameState.lastMove}
            playCard={playCard}
            turn={gameState.turn}
            cardSizes={cardSizes}
          />
        </div>

        {/* Right: Crib & History — fixed 1/4 width on lg+, matches left column */}
        <div className="w-full lg:w-1/4 flex flex-col items-center justify-center gap-5 xl:gap-7 mt-2 lg:mt-0">
          <Crib
            crib={gameState.crib}
            dealer={gameState.dealer}
            players={gameState.players}
            turn={gameState.turn}
            playerId={socket.id}
            lobbyId={lobbyId}
            numPlayers={numPlayers}
            discardToCrib={discardToCrib}
          />

          <div className="hidden lg:block w-full">
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
