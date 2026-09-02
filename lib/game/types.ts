export type Player = 1 | 2;

export type Direction = "front" | "back" | "left" | "right";

export type BarricadeOrientation = "horizontal" | "vertical";

export type PositionData = { row: number; col: number };

export type BarricadeData = {
  orientation: BarricadeOrientation;
  edgeIndex: number;
  startIndex: number;
};

export type GameSnapshot = {
  p1Position: PositionData;
  p2Position: PositionData;
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  barricades: BarricadeData[];
  p1BarricadesRemaining: number;
  p2BarricadesRemaining: number;
};

export type TurnMode = "move" | "barricade";
