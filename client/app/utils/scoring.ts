import type { CardType, CardValue } from "@cross-cribbs/shared-types/CardType";
import type { BoardType } from "@cross-cribbs/shared-types/GameControllerTypes";
import type { ScoreType } from "@cross-cribbs/shared-types/ScoreType";

export function createEmptyScore(): ScoreType {
  return {
    pairs: 0,
    runs: 0,
    fifteens: 0,
    knobs: 0,
    flushes: 0,
    total: 0,
  };
}

export function calculateFifteen(array: (CardType | null)[], targetSum = 15): CardValue[][] {
  const result: CardValue[][] = [];

  function subsetSumsHelper(currentSum: number, startIndex: number, path: CardValue[]) {
    if (currentSum === targetSum) {
      result.push([...path]);
      return;
    }

    for (let i = startIndex; i < array.length; i++) {
      const card = array[i];
      if (!card) continue;
      const cardVal = Math.min(card.value, 10);
      if (currentSum + cardVal <= targetSum) {
        subsetSumsHelper(currentSum + cardVal, i + 1, [...path, card.value]);
      }
    }
  }

  subsetSumsHelper(0, 0, []);
  return result;
}

export function calculateFlush(line: (CardType | null)[]): number {
  const suitCounts: Record<string, number> = {};

  for (const card of line) {
    if (card) {
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    }
  }

  let flushScore = 0;
  for (const count of Object.values(suitCounts)) {
    if (count === 5) return 5;
    if (count === 4) flushScore = 4;
  }

  return flushScore;
}

export function scoreSingleLine(
  line: (CardType | null)[],
  isCenterLine: boolean = false,
  cutCard?: CardType | null,
): ScoreType {
  let pairs = 0;
  let runs = 0;
  let fifteens = 0;
  let knobs = 0;
  let flushes = 0;

  // His Knobs (center line only, card at index 2 is cut card)
  if (cutCard && isCenterLine) {
    for (let j = 0; j < line.length; j++) {
      if (j === 2) continue; // Skip the cut card position itself
      const card = line[j];
      if (card && card.name === "jack" && card.suit === cutCard.suit) {
        knobs = 1;
        break;
      }
    }
  }

  // Count occurrences of card values
  const m: Record<number, number> = {};
  for (const card of line) {
    if (!card) continue;
    m[card.value] = (m[card.value] || 0) + 1;
  }

  // Calculate 15s
  const fifteenCombos = calculateFifteen(line, 15);
  fifteens = fifteenCombos.length * 2;

  // Calculate pairs and runs
  for (const [key, value] of Object.entries(m)) {
    const numKey = Number(key);

    // Pairs score: 2 for pair, 6 for 3-of-a-kind, 12 for 4-of-a-kind
    if (value > 1) {
      if (value === 2) pairs += 2;
      else if (value === 3) pairs += 6;
      else if (value === 4) pairs += 12;
    }

    // Runs score
    let maxrun = 1;
    let multiplier = value;

    if (!(numKey - 1 in m)) {
      let run = 1;

      while (parseInt(key) + run in m) {
        multiplier = Math.max(multiplier, m[parseInt(key) + run]);
        run += 1;
      }
      maxrun = Math.max(run, maxrun);

      if (run < 3) multiplier = 1;
      run = 1;
    }

    if (maxrun >= 3) {
      if (maxrun === 5) runs += 5;
      else if (maxrun === 4) runs += 4 * multiplier;
      else runs += 3 * multiplier;
    }
  }

  // Flush
  flushes = calculateFlush(line);

  const total = pairs + runs + fifteens + knobs + flushes;

  return {
    pairs,
    runs,
    fifteens,
    knobs,
    flushes,
    total,
  };
}

export function transposeBoard(board: BoardType): BoardType {
  if (!board || board.length === 0) return [];
  return board[0].map((_, colIndex) => board.map((row) => row[colIndex]));
}

export interface LiveScoresResult {
  rowScores: ScoreType[];
  colScores: ScoreType[];
}

export function calculateLiveScores(board: BoardType): LiveScoresResult {
  if (!board || board.length !== 5) {
    return {
      rowScores: Array(5).fill(null).map(createEmptyScore),
      colScores: Array(5).fill(null).map(createEmptyScore),
    };
  }

  // Center cut card in Cross Cribbs is at [2][2]
  const cutCard = board[2]?.[2] ?? null;

  const rowScores = board.map((row, r) => scoreSingleLine(row, r === 2, cutCard));
  const transposed = transposeBoard(board);
  const colScores = transposed.map((col, c) => scoreSingleLine(col, c === 2, cutCard));

  return {
    rowScores,
    colScores,
  };
}

export function describeLineScore(line: ScoreType): string {
  const parts: string[] = [];
  if (line.pairs) parts.push(`pairs: ${line.pairs}pt${line.pairs !== 1 ? "s" : ""}`);
  if (line.runs) parts.push(`runs: ${line.runs}pts`);
  if (line.fifteens) parts.push(`15s: ${line.fifteens}pts`);
  if (line.flushes) parts.push(`flush: ${line.flushes}pts`);
  if (line.knobs) parts.push(`knobs: ${line.knobs}pt`);
  return parts.length ? parts.join(", ") : "0 pts";
}
