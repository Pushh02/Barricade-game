export type Player = 1 | 2;

export type Direction = "front" | "back" | "left" | "right";

export type PositionData = { row: number; col: number };

export type GameSnapshot = {
  p1Position: PositionData;
  p2Position: PositionData;
  currentPlayer: Player;
  winner: Player | null;
};
