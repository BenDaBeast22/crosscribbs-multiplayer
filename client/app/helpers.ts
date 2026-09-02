import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";

export function getPlayer(players: PlayerType[], playerNumber: number): PlayerType {
  switch (playerNumber) {
    case 1:
      return players[0];
    case 2:
      return players[1];
    case 3:
      return players[2];
    case 4:
      return players[3];
    default:
      throw new Error("Invalid player number");
  }
}
