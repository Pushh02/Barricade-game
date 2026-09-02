import { GRID_SIZE, MIDDLE_COL } from "./constants";
import { Move } from "./move";
import { Position } from "./position";
import type { Direction, GameSnapshot, Player } from "./types";

const START_POSITIONS: Record<Player, Position> = {
  1: new Position(GRID_SIZE - 1, MIDDLE_COL),
  2: new Position(0, MIDDLE_COL),
};

export class BarricadeGame {
  constructor(
    readonly p1Position: Position,
    readonly p2Position: Position,
    readonly currentPlayer: Player,
    readonly winner: Player | null = null
  ) {}

  static create(): BarricadeGame {
    return new BarricadeGame(
      START_POSITIONS[1],
      START_POSITIONS[2],
      1,
      null
    );
  }

  static fromSnapshot(snapshot: GameSnapshot): BarricadeGame {
    return new BarricadeGame(
      Position.from(snapshot.p1Position),
      Position.from(snapshot.p2Position),
      snapshot.currentPlayer,
      snapshot.winner
    );
  }

  getSnapshot(): GameSnapshot {
    return {
      p1Position: this.p1Position.toJSON(),
      p2Position: this.p2Position.toJSON(),
      currentPlayer: this.currentPlayer,
      winner: this.winner,
    };
  }

  getPosition(player: Player): Position {
    return player === 1 ? this.p1Position : this.p2Position;
  }

  isOver(): boolean {
    return this.winner !== null;
  }

  getValidMoves(): Move[] {
    if (this.isOver()) return [];

    const pos = this.getPosition(this.currentPlayer);
    const opponentPos = this.getPosition(this.currentPlayer === 1 ? 2 : 1);
    const directions: Direction[] = ["front", "back", "left", "right"];
    const moves: Move[] = [];

    for (const direction of directions) {
      const target = pos.add(this.getDirectionDelta(this.currentPlayer, direction));
      if (!target.isInBounds()) continue;
      if (target.equals(opponentPos)) continue;
      moves.push(new Move(direction, target));
    }

    return moves;
  }

  move(direction: Direction): BarricadeGame | null {
    if (this.isOver()) return null;

    const validMove = this.getValidMoves().find((m) => m.direction === direction);
    if (!validMove) return null;

    const player = this.currentPlayer;
    const newP1 =
      player === 1 ? validMove.target : this.p1Position;
    const newP2 =
      player === 2 ? validMove.target : this.p2Position;

    if (this.hasWon(player, validMove.target)) {
      return new BarricadeGame(newP1, newP2, player, player);
    }

    return new BarricadeGame(
      newP1,
      newP2,
      player === 1 ? 2 : 1,
      null
    );
  }

  reset(): BarricadeGame {
    return BarricadeGame.create();
  }

  private getDirectionDelta(player: Player, direction: Direction): Position {
    if (direction === "left") return Position.delta(0, -1);
    if (direction === "right") return Position.delta(0, 1);
    if (player === 1) {
      return direction === "front"
        ? Position.delta(-1, 0)
        : Position.delta(1, 0);
    }
    return direction === "front"
      ? Position.delta(1, 0)
      : Position.delta(-1, 0);
  }

  private hasWon(player: Player, pos: Position): boolean {
    return player === 1 ? pos.row === 0 : pos.row === GRID_SIZE - 1;
  }
}
