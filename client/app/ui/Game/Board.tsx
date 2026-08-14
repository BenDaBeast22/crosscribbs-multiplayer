/*
- Board component:
  - Renders a 5x5 grid of spots
  - Each spot can accept a card
*/

import Spot from "./Spot";
import type { CardSizesType, CardType } from "@cross-cribbs/shared-types/CardType";
import type { BoardPosition } from "@cross-cribbs/shared-types/BoardTypes";
import type { BoardType } from "@cross-cribbs/shared-types/GameControllerTypes";

type ChildProps = {
  board: BoardType;
  lastMove: BoardPosition | null; 
  turn: number;
  playCard: (pos: BoardPosition, turn: number) => void;
  cardSizes: CardSizesType;
};

export default function Board({ board, lastMove, playCard, turn, cardSizes }: ChildProps) {
  let displayBoard = [];
  for (let r = 0; r < 5; r++) {
    let row = [];
    for (let c = 0; c < 5; c++) {
      const isLastMove = !!lastMove && lastMove[0] === r && lastMove[1] === c; 
      row.push(
        <Spot
          pos={[r, c]}
          card={board[r][c]}
          key={`${r}, ${c}`}
          playCard={playCard}
          turn={turn}
          cardSizes={cardSizes}
          isLastMove={isLastMove}
        />,
      );
    }
    displayBoard.push(
      <tr className="w-full" key={r}>
        {row}
      </tr>,
    );
  }

  return (
    <div className="w-full">
      <table className="w-full flex justify-center border-separate border-spacing-[3px]">
        <tbody>{displayBoard}</tbody>
      </table>
    </div>
  );
}