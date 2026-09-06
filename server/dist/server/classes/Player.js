export default class Player {
    id;
    playerId;
    num;
    name;
    hand;
    discardedToCrib;
    constructor(id, playerId, num, name, hand, discardedToCrib) {
        this.id = id;
        this.playerId = playerId;
        this.num = num;
        this.name = name;
        this.hand = hand;
        this.discardedToCrib = discardedToCrib;
    }
}
