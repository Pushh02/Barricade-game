import type { Direction } from "./types";
import { Position } from "./position";

export class Move {
  constructor(
    readonly direction: Direction,
    readonly target: Position
  ) {}
}
