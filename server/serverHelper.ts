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
