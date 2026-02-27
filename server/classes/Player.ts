import type { CardType } from "@cross-cribbs/shared-types/CardType.js";
import type { PlayerType } from "@cross-cribbs/shared-types/PlayerType.js";

export default class Player implements PlayerType {
  id: string;
  playerId: string;
  num: number;
  name: string;
  hand: CardType[];
  discardedToCrib: CardType[];

  constructor(id: string, playerId: string, num: number, name: string, hand: CardType[], discardedToCrib: CardType[]) {
    this.id = id;
    this.playerId = playerId;
    this.num = num;
    this.name = name;
    this.hand = hand;
    this.discardedToCrib = discardedToCrib;
  }
}
