import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType";

const ROW_COLORS = ["cyan-400", "blue-800"];
const COLUMN_COLORS = ["fuchsia-400", "pink-800"];
// Row = odd player.num (1, 3), Column = even player.num (2, 4) — matches
// GameController.handleRoundEnd()'s crib-scoring rule on the server exactly.
export function isRowTeam(playerNum: number): boolean {
  return playerNum % 2 === 1;
}

export function getTeamLabel(playerNum: number): "Row" | "Column" {
  return isRowTeam(playerNum) ? "Row" : "Column";
}

export function getPlayerColor(playerNum: number) {
  const isRow = isRowTeam(playerNum);
  const positionInTeam = Math.floor((playerNum - 1) / 2); // 0 for player 1/2, 1 for player 3/4
  const palette = isRow ? ROW_COLORS : COLUMN_COLORS;
  const color = palette[positionInTeam] ?? palette[palette.length - 1];
  return { team: isRow ? ("Row" as const) : ("Column" as const), isRow, color };
}
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
