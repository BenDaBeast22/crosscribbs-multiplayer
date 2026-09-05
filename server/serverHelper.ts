import { Lobby, Player } from "./classes/gameHelpers";

export function startDisconnectCountdown(
  io: any,
  lobby: Lobby,
  player: Player,
  disconnectedPlayers: Record<string, NodeJS.Timeout>,
) {
  // Clear existing countdown if one exists
  if (disconnectedPlayers[player.id]) {
    clearInterval(disconnectedPlayers[player.id]);
  }

  const interval = setInterval(() => {
    const remaining = player.disconnectExpiresAt! - Date.now();

    if (remaining <= 0) {
      clearInterval(interval);

      const index = lobby.players.findIndex((p) => p.id === player.id);
      if (index !== -1) {
        let [deletedPlayer] = lobby.players.splice(index, 1); // remove disconnected player
        console.log("deletedPlayer = ", deletedPlayer);

        // reasign host
        if (lobby.host === deletedPlayer.playerId && lobby.players.length > 0) {
          if (lobby.players[0]) {
            lobby.host = lobby.players[0].playerId;
          }
        }

        if (lobby.host === player.id && lobby.players.length > 0) {
          lobby.host = lobby.players[0].id;
        }

        io.to(lobby.id).emit("lobbyUpdate", lobby);
      }
      return;
    }
    // emit remaining time so UI updates
    io.to(lobby.id).emit("lobbyUpdate", lobby);
  }, 1000);

  // Store interval so we can cancel it on reconnect
  disconnectedPlayers[player.id] = interval;
}

export function attachSocketUser(socket: any, lobbyId: string, playerId: any, playerName: any) {
  if (lobbyId) socket.data.lobbyId = lobbyId;
  if (playerId) socket.data.playerId = playerId;
  socket.data.lobbyId = lobbyId;
  socket.data.playerId = playerId;
  socket.data.playerName = playerName;
}

// For 2v2: interleaves players by team so Row players land on odd player.num
// (1, 3) and Column players land on even (2, 4), matching isRowTeam()'s rule —
// regardless of actual join order, since players can switch teams pre-game.
export function orderPlayersByTeam(players: any[]): any[] {
  const rowPlayers = players.filter((p) => p.team === "Row");
  const columnPlayers = players.filter((p) => p.team === "Column");
  const ordered: any[] = [];
  const maxLen = Math.max(rowPlayers.length, columnPlayers.length);
  for (let i = 0; i < maxLen; i++) {
    if (rowPlayers[i]) ordered.push(rowPlayers[i]);
    if (columnPlayers[i]) ordered.push(columnPlayers[i]);
  }
  return ordered;
}
