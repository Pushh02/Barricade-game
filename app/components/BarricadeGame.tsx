"use client";

import { useState } from "react";
import {
  BarricadeGame,
  GRID_SIZE,
  type Direction,
  type Player,
} from "@/lib/game";

export default function BarricadeGameBoard() {
  const [game, setGame] = useState(() => BarricadeGame.create());

  const { p1Position, p2Position, currentPlayer, winner } = game;
  const validMoves = game.getValidMoves();

  function handleMove(direction: Direction) {
    const next = game.move(direction);
    if (next) setGame(next);
  }

  function handleCellClick(row: number, col: number) {
    const move = validMoves.find(
      (m) => m.target.row === row && m.target.col === col
    );
    if (move) handleMove(move.direction);
  }

  function resetGame() {
    setGame(game.reset());
  }

  const validTargets = new Set(
    validMoves.map((m) => `${m.target.row},${m.target.col}`)
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-6 text-zinc-100">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Barricade</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Race to the opposite side. Move one cell forward, backward, or sideways.
        </p>
      </header>

      <div className="flex items-center gap-8">
        <PlayerBadge player={1} active={!winner && currentPlayer === 1} />
        <span className="text-zinc-600">vs</span>
        <PlayerBadge player={2} active={!winner && currentPlayer === 2} />
      </div>

      {!winner && (
        <p className="text-sm text-zinc-300">
          <span className={currentPlayer === 1 ? "text-blue-400" : "text-rose-400"}>
            Player {currentPlayer}
          </span>
          {"'s turn — click a highlighted cell or use the arrows"}
        </p>
      )}

      <div className="relative">
        <div
          className="grid gap-1 rounded-xl bg-zinc-800 p-2 shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            const isP1 = p1Position.row === row && p1Position.col === col;
            const isP2 = p2Position.row === row && p2Position.col === col;
            const isValidTarget = validTargets.has(`${row},${col}`);
            const isGoalRowP1 = row === 0;
            const isGoalRowP2 = row === GRID_SIZE - 1;

            return (
              <button
                key={i}
                type="button"
                disabled={!isValidTarget}
                onClick={() => handleCellClick(row, col)}
                className={[
                  "relative flex h-10 w-10 items-center justify-center rounded-md transition-all sm:h-12 sm:w-12",
                  isGoalRowP1 && "bg-blue-950/60",
                  isGoalRowP2 && "bg-rose-950/60",
                  !isGoalRowP1 && !isGoalRowP2 && "bg-zinc-700/50",
                  isValidTarget &&
                    "cursor-pointer ring-2 ring-amber-400/80 hover:bg-amber-400/20",
                  !isValidTarget && !isP1 && !isP2 && "cursor-default",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`Cell ${row + 1}, ${col + 1}`}
              >
                {isP1 && (
                  <span className="h-7 w-7 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40 ring-2 ring-blue-300" />
                )}
                {isP2 && (
                  <span className="h-7 w-7 rounded-full bg-rose-500 shadow-lg shadow-rose-500/40 ring-2 ring-rose-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!winner && (
        <div className="flex gap-2">
          <MoveButton
            label="↑ Front"
            direction="front"
            enabled={validMoves.some((m) => m.direction === "front")}
            onMove={handleMove}
            player={currentPlayer}
          />
          <MoveButton
            label="← Left"
            direction="left"
            enabled={validMoves.some((m) => m.direction === "left")}
            onMove={handleMove}
            player={currentPlayer}
          />
          <MoveButton
            label="→ Right"
            direction="right"
            enabled={validMoves.some((m) => m.direction === "right")}
            onMove={handleMove}
            player={currentPlayer}
          />
          <MoveButton
            label="↓ Back"
            direction="back"
            enabled={validMoves.some((m) => m.direction === "back")}
            onMove={handleMove}
            player={currentPlayer}
          />
        </div>
      )}

      {winner && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-zinc-900 px-8 py-6 ring-1 ring-zinc-700">
          <p className="text-xl font-semibold">
            <span className={winner === 1 ? "text-blue-400" : "text-rose-400"}>
              Player {winner}
            </span>{" "}
            wins!
          </p>
          <button
            type="button"
            onClick={resetGame}
            className="rounded-lg bg-zinc-700 px-5 py-2 text-sm font-medium transition hover:bg-zinc-600"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}

function PlayerBadge({ player, active }: { player: Player; active: boolean }) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
        player === 1 ? "bg-blue-500/10 text-blue-300" : "bg-rose-500/10 text-rose-300",
        active && (player === 1 ? "ring-2 ring-blue-400" : "ring-2 ring-rose-400"),
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "h-3 w-3 rounded-full",
          player === 1 ? "bg-blue-500" : "bg-rose-500",
        ].join(" ")}
      />
      Player {player}
      {active && <span className="text-xs opacity-70">(turn)</span>}
    </div>
  );
}

function MoveButton({
  label,
  direction,
  enabled,
  onMove,
  player,
}: {
  label: string;
  direction: Direction;
  enabled: boolean;
  onMove: (d: Direction) => void;
  player: Player;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => onMove(direction)}
      className={[
        "rounded-lg px-4 py-2 text-sm font-medium transition",
        enabled
          ? player === 1
            ? "bg-blue-600 hover:bg-blue-500"
            : "bg-rose-600 hover:bg-rose-500"
          : "cursor-not-allowed bg-zinc-800 text-zinc-600",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
