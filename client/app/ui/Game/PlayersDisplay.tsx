import Player from "./Player";
import { socket } from "../../connections/socket";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";
import type { CardType } from "@cross-cribbs/shared-types/CardType";

type ChildProps = {
  players: PlayerType[];
  playerNames: string[];
  numPlayers: number;
  lobbyId: string | undefined;
  turn: number;
  crib: CardType[];
  dealer: number | null;
};

function Divider() {
  return (
    <div
      className="w-px self-stretch"
      style={{
        background:
          "linear-gradient(to bottom, transparent, rgba(255,255,255,0.35) 20%, rgba(255,255,255,0.35) 80%, transparent)",
      }}
      aria-hidden="true"
    />
  );
}

export default function PlayersDisplay({ players, playerNames, numPlayers, lobbyId, turn, crib, dealer }: ChildProps) {
  const renderPlayer = (index: number) => (
    <Player
      name={playerNames[index]}
      player={players[index]}
      turn={turn}
      crib={crib}
      numPlayers={numPlayers}
      lobbyId={lobbyId}
      playerId={socket.id}
      dealer={dealer}
    />
  );

  return (
    <div className="w-full players-display text-xs md:text-base font-medium italic md:not-italic mt-1 mb-3 flex justify-center">
      {numPlayers === 4 ? (
        <div className="grid grid-cols-[auto_auto_auto] gap-x-2 md:gap-x-3 gap-y-3 md:gap-y-4 items-center justify-items-center">
          <span className="text-cyan-400 font-bold text-center">Row</span>
          <Divider />
          <span className="text-fuchsia-400 font-bold text-center">Column</span>

          <div className="flex justify-center">{renderPlayer(0)}</div>
          <Divider />
          <div className="flex justify-center">{renderPlayer(1)}</div>

          <div className="flex justify-center">{renderPlayer(2)}</div>
          <Divider />
          <div className="flex justify-center">{renderPlayer(3)}</div>
        </div>
      ) : (
        <div className="grid grid-cols-[auto_auto_auto] gap-x-2 md:gap-x-3 gap-y-3 items-center justify-items-center">
          <span className="text-cyan-400 font-bold text-center">Row</span>
          <Divider />
          <span className="text-fuchsia-400 font-bold text-center">Column</span>

          <div className="flex justify-center">{renderPlayer(0)}</div>
          <Divider />
          <div className="flex justify-center">{renderPlayer(1)}</div>
        </div>
      )}
    </div>
  );
}
