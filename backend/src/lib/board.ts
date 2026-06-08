export type TileEffect = {
  from: number;
  to: number;
  kind: "LADDER" | "SNAKE";
};

export const BOARD_SIZE = 100;
export const START_TILE = 1;
export const WIN_TILE = 100;

export const ladders: TileEffect[] = [
  { from: 4, to: 14, kind: "LADDER" },
  { from: 9, to: 31, kind: "LADDER" },
  { from: 20, to: 38, kind: "LADDER" },
  { from: 28, to: 84, kind: "LADDER" },
  { from: 40, to: 59, kind: "LADDER" },
  { from: 51, to: 67, kind: "LADDER" },
  { from: 63, to: 81, kind: "LADDER" },
  { from: 71, to: 91, kind: "LADDER" }
];

export const snakes: TileEffect[] = [
  { from: 17, to: 7, kind: "SNAKE" },
  { from: 54, to: 34, kind: "SNAKE" },
  { from: 62, to: 19, kind: "SNAKE" },
  { from: 64, to: 60, kind: "SNAKE" },
  { from: 87, to: 24, kind: "SNAKE" },
  { from: 93, to: 73, kind: "SNAKE" },
  { from: 95, to: 75, kind: "SNAKE" },
  { from: 99, to: 78, kind: "SNAKE" }
];

export const tileEffects = [...ladders, ...snakes];

export function getTileEffect(tile: number) {
  return tileEffects.find((effect) => effect.from === tile);
}

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function calculateMove(currentTile: number, dice: number) {
  const tentative = currentTile + dice;
  if (tentative > WIN_TILE) {
    return currentTile;
  }
  return tentative;
}
