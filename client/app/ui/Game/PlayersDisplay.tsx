import Player from "./Player";
import { socket } from "../../connections/socket";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import type { CardSizesType, CardType } from "@cross-cribbs/shared-types/CardType";

type ChildProps = {
  players: PlayerType[];
  playerNames: string[];
  numPlayers: number;
  lobbyId: string | undefined;
  turn: number;
  crib: CardType[];
  cardSizes: CardSizesType;
};

export default function PlayersDisplay({
  players,
  playerNames,
  numPlayers,
  lobbyId,
  turn,
  crib,
  cardSizes,
}: ChildProps) {
  return (
    <div className="w-full players-display text-xs md:text-base font-medium flex justify-center italic md:not-italic mt-1.5 mb-3">
      {numPlayers === 4 ? (
        <div className="flex flex-col">
          {/* Side-by-side on mobile, stacked column on lg screens and up */}
          <div className="flex flex-row lg:flex-col justify-center gap-3 md:gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-center font-medium text-white">Row Team:</span>
              {/* Row Team Players */}
              <div className="flex flex-row gap-2">
                <Player
                  name={playerNames[0]}
                  player={players[0]}
                  turn={turn}
                  crib={crib}
                  numPlayers={numPlayers}
                  lobbyId={lobbyId}
                  playerId={socket.id}
                  cardSizes={cardSizes}
                />
                <Player
                  name={playerNames[2]}
                  player={players[2]}
                  turn={turn}
                  crib={crib}
                  numPlayers={numPlayers}
                  lobbyId={lobbyId}
                  playerId={socket.id}
                  cardSizes={cardSizes}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-center font-medium text-white">Column Team:</span>
              {/* Column Team Players */}
              <div className="flex flex-row gap-2 lg:gap-0">
                <Player
                  name={playerNames[1]}
                  player={players[1]}
                  turn={turn}
                  crib={crib}
                  numPlayers={numPlayers}
                  lobbyId={lobbyId}
                  playerId={socket.id}
                  cardSizes={cardSizes}
                />
                <Player
                  name={playerNames[3]}
                  player={players[3]}
                  turn={turn}
                  crib={crib}
                  numPlayers={numPlayers}
                  lobbyId={lobbyId}
                  playerId={socket.id}
                  cardSizes={cardSizes}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 2 player layout
        <div className="flex flex-row gap-4 lg:gap-2">
          <div className="flex flex-col gap-2">
            <span className="text-center font-medium text-white">Row:</span>
            <Player
              name={playerNames[0]}
              player={players[0]}
              turn={turn}
              crib={crib}
              numPlayers={numPlayers}
              lobbyId={lobbyId}
              playerId={socket.id}
              cardSizes={cardSizes}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-center font-medium text-white">Column:</span>
            <Player
              name={playerNames[1]}
              player={players[1]}
              turn={turn}
              crib={crib}
              numPlayers={numPlayers}
              lobbyId={lobbyId}
              playerId={socket.id}
              cardSizes={cardSizes}
            />
          </div>
        </div>
      )}
    </div>
  );
}
