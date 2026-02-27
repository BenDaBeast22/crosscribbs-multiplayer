import type { CardType } from "./CardType.js";

export interface PlayerType {
  id: string; // socket id
  playerId: string; // player id
  num: number;
  name: string; // player username
  hand: CardType[];
  discardedToCrib: CardType[];
  disconnected?: boolean;
  disconnectExpiresAt?: number;
}
