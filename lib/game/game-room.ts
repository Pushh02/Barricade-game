import { BarricadeGame } from "./barricade-game";
import type { Direction, GameSnapshot, Player } from "./types";

export class GameRoom {
  private game: BarricadeGame;
  private readonly playerSlots: Map<Player, string | null>;

  constructor(
    readonly id: string,
    game: BarricadeGame = BarricadeGame.create()
  ) {
    this.game = game;
    this.playerSlots = new Map([
      [1, null],
      [2, null],
    ]);
  }

  getGame(): BarricadeGame {
    return this.game;
  }

  getSnapshot(): GameSnapshot {
    return this.game.getSnapshot();
  }

  isFull(): boolean {
    return this.getPlayerId(1) !== null && this.getPlayerId(2) !== null;
  }

  getPlayerId(player: Player): string | null {
    return this.playerSlots.get(player) ?? null;
  }

  getPlayerById(playerId: string): Player | null {
    for (const [player, id] of this.playerSlots) {
      if (id === playerId) return player;
    }
    return null;
  }

  assignPlayer(playerId: string): Player | null {
    if (this.getPlayerById(playerId) !== null) {
      return this.getPlayerById(playerId);
    }

    for (const player of [1, 2] as const) {
      if (this.getPlayerId(player) === null) {
        this.playerSlots.set(player, playerId);
        return player;
      }
    }

    return null;
  }

  handleMove(playerId: string, direction: Direction): BarricadeGame | null {
    const player = this.getPlayerById(playerId);
    if (player === null) return null;
    if (this.game.currentPlayer !== player) return null;

    const nextGame = this.game.move(direction);
    if (nextGame) {
      this.game = nextGame;
    }
    return nextGame;
  }

  reset(): void {
    this.game = this.game.reset();
  }
}
