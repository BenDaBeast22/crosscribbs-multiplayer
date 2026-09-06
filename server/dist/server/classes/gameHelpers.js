// gameHelpers.ts
// Export lobbies and games maps so all handlers can share it
export const lobbies = {}; // { lobbyId: { players: [], host: socketId }}
export const games = {};
/**
 * Returns the correct game instance.
 * If lobbyId is provided, returns the multiplayer game.
 * Otherwise, returns the local game for this socket.
 */
export function getGame(playerId, lobbyId) {
    const id = lobbyId || playerId;
    return games[id] || null;
}
/**
 * Optional: delete a game when a socket disconnects
 */
export function deleteGame(playerId, lobbyId) {
    const id = lobbyId || playerId;
    delete games[id];
}
