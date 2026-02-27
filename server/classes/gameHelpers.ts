// gameHelpers.ts

import type GameController from "../gameController.js";

export interface Player {
  id: string;
  name: string;
  playerId: string;
  disconnected?: boolean;
  disconnectExpiresAt?: number;
}

export interface Lobby {
  players: Player[];
  host: string;
  numPlayers: number;
  id: string;
  gameStarted?: true;
}

// Export lobbies and games maps so all handlers can share it
export const lobbies: Record<string, Lobby> = {}; // { lobbyId: { players: [], host: socketId }}
export const games: Record<string, GameController> = {};

/**
 * Returns the correct game instance.
 * If lobbyId is provided, returns the multiplayer game.
 * Otherwise, returns the local game for this socket.
 */
export function getGame(playerId: string, lobbyId?: string): GameController | null {
  const id = lobbyId || playerId;
  return games[id] || null;
}

/**
 * Optional: delete a game when a socket disconnects
 */
export function deleteGame(playerId: string, lobbyId?: string) {
  const id = lobbyId || playerId;
  delete games[id];
}
