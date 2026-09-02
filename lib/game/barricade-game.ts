import { Barricade } from "./barricade-piece";
import { BARRICADE_LIMIT, GRID_SIZE, MIDDLE_COL } from "./constants";
import { Move } from "./move";
import {
  bothPlayersHavePathToGoal,
  isMoveBlockedByBarricades,
} from "./pathfinding";
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
    readonly barricades: Barricade[],
    readonly p1BarricadesRemaining: number,
    readonly p2BarricadesRemaining: number,
    readonly winner: Player | null = null,
    readonly isDraw: boolean = false
  ) {}

  static create(): BarricadeGame {
    return new BarricadeGame(
      START_POSITIONS[1],
      START_POSITIONS[2],
      1,
      [],
      BARRICADE_LIMIT,
      BARRICADE_LIMIT,
      null,
      false
    );
  }

  static fromSnapshot(snapshot: GameSnapshot): BarricadeGame {
    return new BarricadeGame(
      Position.from(snapshot.p1Position),
      Position.from(snapshot.p2Position),
      snapshot.currentPlayer,
      snapshot.barricades.map(Barricade.from),
      snapshot.p1BarricadesRemaining,
      snapshot.p2BarricadesRemaining,
      snapshot.winner,
      snapshot.isDraw
    );
  }

  getSnapshot(): GameSnapshot {
    return {
      p1Position: this.p1Position.toJSON(),
      p2Position: this.p2Position.toJSON(),
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      isDraw: this.isDraw,
      barricades: this.barricades.map((b) => b.toJSON()),
      p1BarricadesRemaining: this.p1BarricadesRemaining,
      p2BarricadesRemaining: this.p2BarricadesRemaining,
    };
  }

  getPosition(player: Player): Position {
    return player === 1 ? this.p1Position : this.p2Position;
  }

  getBarricadesRemaining(player: Player): number {
    return player === 1 ? this.p1BarricadesRemaining : this.p2BarricadesRemaining;
  }

  isOver(): boolean {
    return this.winner !== null || this.isDraw;
  }

  getValidMoves(forPlayer: Player = this.currentPlayer): Move[] {
    if (this.isOver()) return [];

    const pos = this.getPosition(forPlayer);
    const opponentPos = this.getPosition(forPlayer === 1 ? 2 : 1);
    const directions: Direction[] = ["front", "back", "left", "right"];
    const moves: Move[] = [];

    for (const direction of directions) {
      const target = pos.add(this.getDirectionDelta(forPlayer, direction));
      if (!target.isInBounds()) continue;
      if (target.equals(opponentPos)) continue;
      if (this.isMoveBlocked(pos, target)) continue;
      moves.push(new Move(direction, target));
    }

    return moves;
  }

  getValidBarricadePlacements(): Barricade[] {
    if (this.isOver()) return [];
    if (this.getBarricadesRemaining(this.currentPlayer) <= 0) return [];

    const valid: Barricade[] = [];

    for (let edgeRow = 0; edgeRow < GRID_SIZE - 1; edgeRow++) {
      for (let startCol = 0; startCol <= GRID_SIZE - 2; startCol++) {
        const candidate = new Barricade("horizontal", edgeRow, startCol);
        if (this.canPlaceBarricade(candidate)) valid.push(candidate);
      }
    }

    for (let edgeCol = 0; edgeCol < GRID_SIZE - 1; edgeCol++) {
      for (let startRow = 0; startRow <= GRID_SIZE - 2; startRow++) {
        const candidate = new Barricade("vertical", edgeCol, startRow);
        if (this.canPlaceBarricade(candidate)) valid.push(candidate);
      }
    }

    return valid;
  }

  canPlaceBarricade(barricade: Barricade): boolean {
    if (this.isOver()) return false;
    if (this.getBarricadesRemaining(this.currentPlayer) <= 0) return false;
    if (!barricade.isInBounds()) return false;
    if (this.barricades.some((existing) => barricade.overlaps(existing))) {
      return false;
    }

    const proposed = [...this.barricades, barricade];
    return bothPlayersHavePathToGoal(
      this.p1Position,
      this.p2Position,
      proposed
    );
  }

  move(direction: Direction): BarricadeGame | null {
    if (this.isOver()) return null;

    const validMove = this.getValidMoves().find((m) => m.direction === direction);
    if (!validMove) return null;

    const player = this.currentPlayer;
    const newP1 = player === 1 ? validMove.target : this.p1Position;
    const newP2 = player === 2 ? validMove.target : this.p2Position;

    if (this.hasWon(player, validMove.target)) {
      return new BarricadeGame(
        newP1,
        newP2,
        player,
        this.barricades,
        this.p1BarricadesRemaining,
        this.p2BarricadesRemaining,
        player,
        false
      );
    }

    const nextPlayer: Player = player === 1 ? 2 : 1;
    return this.advanceTurn(
      newP1,
      newP2,
      nextPlayer,
      this.barricades,
      this.p1BarricadesRemaining,
      this.p2BarricadesRemaining
    );
  }

  placeBarricade(barricade: Barricade): BarricadeGame | null {
    if (this.isOver()) return null;
    if (!this.canPlaceBarricade(barricade)) return null;

    const player = this.currentPlayer;
    const newBarricades = [...this.barricades, barricade];
    const newP1Remaining =
      player === 1 ? this.p1BarricadesRemaining - 1 : this.p1BarricadesRemaining;
    const newP2Remaining =
      player === 2 ? this.p2BarricadesRemaining - 1 : this.p2BarricadesRemaining;
    const nextPlayer: Player = player === 1 ? 2 : 1;

    return this.advanceTurn(
      this.p1Position,
      this.p2Position,
      nextPlayer,
      newBarricades,
      newP1Remaining,
      newP2Remaining
    );
  }

  reset(): BarricadeGame {
    return BarricadeGame.create();
  }

  private advanceTurn(
    p1Position: Position,
    p2Position: Position,
    nextPlayer: Player,
    barricades: Barricade[],
    p1BarricadesRemaining: number,
    p2BarricadesRemaining: number
  ): BarricadeGame {
    const nextGame = new BarricadeGame(
      p1Position,
      p2Position,
      nextPlayer,
      barricades,
      p1BarricadesRemaining,
      p2BarricadesRemaining,
      null,
      false
    );

    if (nextGame.isPlayerStuck(nextPlayer)) {
      return new BarricadeGame(
        p1Position,
        p2Position,
        nextPlayer,
        barricades,
        p1BarricadesRemaining,
        p2BarricadesRemaining,
        null,
        true
      );
    }

    return nextGame;
  }

  private isPlayerStuck(player: Player): boolean {
    const moves = this.getValidMoves(player);
    const barricadesLeft = this.getBarricadesRemaining(player);
    return moves.length === 0 && barricadesLeft === 0;
  }

  private isMoveBlocked(from: Position, to: Position): boolean {
    return isMoveBlockedByBarricades(from, to, this.barricades);
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
