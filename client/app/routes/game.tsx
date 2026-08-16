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
  let { gameType, numPlayers, playerNames } = location.state || {}; // set local settings
  const [gameState, setGameState] = useState<GameStateType | null>(initialGameState || null);
  const [players, setPlayers] = useState<PlayerType[]>(initialGameState?.players || []);
  const playerId = localStorage.getItem("playerId");
  const [revealGameOver, setRevealGameOver] = useState(false);

  // Initialize refs to the CURRENT counts so a fresh page load / rejoin
  // doesn't fire sounds for cards that were already on the board.
  const prevBoardCountRef = useRef(gameState?.board.flat().filter(Boolean).length ?? 0);
  const prevCribLengthRef = useRef(gameState?.crib.length ?? 0);



  // console.log("lobby id = ", lobbyId);
  // console.log("local p names = ", playerNames);
  // console.log("local num ps = ", numPlayers);
  useEffect(() => {
    // if (!lobbyId) {
    //   console.log("LOBBY: lobby id = ", lobbyId);
    //   navigate("/multiplayer-setup");
    // }

    socket.emit("rejoinGame", { lobbyId, playerId });

    console.log("My player ID:", playerId);
    console.log("location.state: ", location.state);

    const handleGameUpdate = (state: GameStateType) => {
      console.log("Game state updated", state);
      setGameState(state);
      setPlayers(state.players);
    };

    // const handlePlayerUpdate = (updatedPlayers: PlayerType[]) => {
    //   setPlayers(updatedPlayers);
    // };

    // socket.on("playerUpdate", handlePlayerUpdate);

    // Attach listeners
    socket.on("gameStateUpdate", handleGameUpdate);

    // Cleanup on unmount
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
    if (!gameState.gameOver) setRevealGameOver(false);
  }, [gameState.gameOver]);

  let isMultiplayer = false;
  if (gameState.lobby) {
    numPlayers = gameState.lobby.numPlayers;
    playerNames = gameState.lobby.players.map((p) => p.name);
    isMultiplayer = true;
  }

  console.log("playerNames = ", playerNames);

  // if (!gameState.dealerSelectionComplete) {
  //   return <DealerSelection dealerSelectionCards={gameState.dealerSelectionCards} playerNames={playerNames} />;
  // }

  const handleResetGame = () => {
    const payload = { lobbyId: isMultiplayer ? lobbyId : undefined, playerId };
    socket.emit("resetGame", payload);
  };

  const handleBackToMenu = () => {
    handleResetGame();
    navigate("/");
  };
  // The RoundScore "Next" button now needs to branch: normal round -> nextRound(),
  // final round -> just reveal the GameOver screen locally instead of calling the server
  const handleRoundScoreNext = () => {
    if (gameState.gameOver) {
      setRevealGameOver(true);
    } else {
      nextRound();
    }
  };
  const playCard = (pos: BoardPosition, turn: number) => {
    // Optimistic update: remove top card from your hand
    // setPlayers((prev) =>
    //   prev.map((p) => {
    //     if ((p.num = turn)) {
    //       return { ...p, hand: p.hand.slice(0, -1) }; // remove top card
    //     }
    //     return p;
    //   }),
    // );

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
    base: "w-[54.075px] h-[75.6px] max-w-[54.075px] max-h-[75.6px]",
    sm: "md:w-[68px] md:h-[95px] md:max-w-[68px] md:max-h-[95px]",   //  kicks in at 768px, still stacked layout
    md: "lg:w-[81.9px] lg:h-[116.55px] lg:max-w-[93.6px] lg:max-h-[133.2px]", // kicks in at 1024px, 3-col layout
    xl: "2xl:w-[93.6px] 2xl:h-[133.2px]",
  };

  return (
    <div className="bg-main-screen min-h-screen w-full flex flex-col">
      <Header totalScores={gameState.totalScores} backToMenu={handleBackToMenu} turn={gameState.turn} paused={gameState.roundScoreVisible || gameState.gameOver} playerNames={playerNames} dealer={gameState.dealer} />
      <div className="flex-1 flex flex-col lg:flex-row relative items-center justify-center gap-5 lg:gap-0 2xl:gap-7">
        <div className="w-full lg:w-1/3">
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-10">
              <PlayersDisplay
                lobbyId={lobbyId}
                numPlayers={numPlayers}
                playerNames={playerNames}
                players={players}
                turn={gameState.turn}
                crib={gameState.crib}
                cardSizes={cardSizes}
              ></PlayersDisplay>
              {/* <TurnIndicator
                className="hidden md:block"
                turn={gameState.turn}
                playerNames={playerNames}
                dealer={gameState.dealer}
              /> */}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/3">
          <Board board={gameState.board} lastMove={gameState.lastMove} playCard={playCard} turn={gameState.turn} cardSizes={cardSizes} />
        </div>
        <div className="w-full lg:w-1/3">
          <div className="flex justify-center">
            <div className="inline-flex flex-col items-center gap-10">
              <Crib crib={gameState.crib} dealer={gameState.dealer} cardSizes={cardSizes} />
              <RoundHistory roundHistory={gameState.roundHistory} hideLatest={gameState.roundScoreVisible} />
            </div>
          </div>
        </div>

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
          />
        )}
        {gameState.gameOver && revealGameOver && (
          <GameOver
            winner={gameState.winner}
            totalScores={gameState.totalScores}
            resetGame={handleResetGame}
            roundHistory={gameState.roundHistory}
            onBackToMenu={handleBackToMenu}
          />
        )}
        {/* {!gameState.gameOver && <BottomHud gameState={gameState} playerNames={playerNames} />} */}
      </div>
    </div>
  );
}
