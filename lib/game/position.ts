import { GRID_SIZE } from "./constants";
import type { PositionData } from "./types";

export class Position {
  constructor(
    readonly row: number,
    readonly col: number
  ) {}

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  add(other: Position): Position {
    return new Position(this.row + other.row, this.col + other.col);
  }

  isInBounds(): boolean {
    return (
      this.row >= 0 &&
      this.row < GRID_SIZE &&
      this.col >= 0 &&
      this.col < GRID_SIZE
    );
  }

  toJSON(): PositionData {
    return { row: this.row, col: this.col };
  }

  static from(data: PositionData): Position {
    return new Position(data.row, data.col);
  }

  static delta(row: number, col: number): Position {
    return new Position(row, col);
  }
}
