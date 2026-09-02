"use client";

import { useState } from "react";
import {
  Barricade,
  BarricadeGame,
  GRID_SIZE,
  type Direction,
  type Player,
} from "@/lib/game";

/** 9 cells + 8 gaps → 17 tracks: cell, gap, cell, gap, …, cell */
const BOARD_TRACK_TEMPLATE = `repeat(${GRID_SIZE - 1}, minmax(2.5rem, 1fr) 0.75rem) minmax(2.5rem, 1fr)`;

function cellGridStyle(row: number, col: number) {
  return {
    gridRow: row * 2 + 1,
    gridColumn: col * 2 + 1,
  };
}

function gapGridStyle(barricade: Barricade) {
  const { gridRow, gridColumn, rowSpan, colSpan } =
    barricade.getGapGridPlacement();
  return {
    gridRow: `${gridRow} / span ${rowSpan}`,
    gridColumn: `${gridColumn} / span ${colSpan}`,
  };
}

export default function BarricadeGameBoard() {
  const [game, setGame] = useState(() => BarricadeGame.create());
  const [previewBarricade, setPreviewBarricade] = useState<Barricade | null>(
    null
  );

  const {
    p1Position,
    p2Position,
    currentPlayer,
    winner,
    isDraw,
    barricades,
    p1BarricadesRemaining,
    p2BarricadesRemaining,
  } = game;

  const isOver = game.isOver();
  const validMoves = game.getValidMoves();
  const canPlaceBarricade =
    !isOver && game.getBarricadesRemaining(currentPlayer) > 0;
  const validPlacements = canPlaceBarricade
    ? game.getValidBarricadePlacements()
    : [];

  function handleMove(direction: Direction) {
    const next = game.move(direction);
    if (next) {
      setGame(next);
      setPreviewBarricade(null);
    }
  }

  function handleCellClick(row: number, col: number) {
    if (isOver) return;

    const move = validMoves.find(
      (m) => m.target.row === row && m.target.col === col
    );
    if (move) handleMove(move.direction);
  }

  function handlePlaceBarricade(barricade: Barricade) {
    const next = game.placeBarricade(barricade);
    if (next) {
      setGame(next);
      setPreviewBarricade(null);
    }
  }

  function resetGame() {
    setGame(game.reset());
    setPreviewBarricade(null);
  }

  const validTargets = new Set(
    validMoves.map((m) => `${m.target.row},${m.target.col}`)
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-6 text-zinc-100">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Barricade</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Race to the opposite side. Move your piece or click a gap between
          cells to place a barricade.
        </p>
      </header>

      <div className="flex items-center gap-8">
        <PlayerBadge
          player={1}
          active={!isOver && currentPlayer === 1}
          barricadesRemaining={p1BarricadesRemaining}
        />
        <span className="text-zinc-600">vs</span>
        <PlayerBadge
          player={2}
          active={!isOver && currentPlayer === 2}
          barricadesRemaining={p2BarricadesRemaining}
        />
      </div>

      {!isOver && (
        <p className="text-sm text-zinc-300">
          <span
            className={
              currentPlayer === 1 ? "text-blue-400" : "text-rose-400"
            }
          >
            Player {currentPlayer}
          </span>
          {"'s turn — click a highlighted cell to move, or hover a gap to place a barricade"}
        </p>
      )}

      <div
        className="grid rounded-xl bg-zinc-800 p-2 shadow-2xl"
        style={{
          gridTemplateColumns: BOARD_TRACK_TEMPLATE,
          gridTemplateRows: BOARD_TRACK_TEMPLATE,
        }}
        onMouseLeave={() => setPreviewBarricade(null)}
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
              key={`cell-${row}-${col}`}
              type="button"
              style={cellGridStyle(row, col)}
              onClick={() => handleCellClick(row, col)}
              onMouseEnter={() => setPreviewBarricade(null)}
              className={[
                "flex h-full min-h-10 w-full min-w-10 items-center justify-center rounded-md transition-all sm:min-h-12 sm:min-w-12",
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

        {barricades.map((barricade) => (
          <PlacedBarricade key={barricade.key()} barricade={barricade} />
        ))}

        {validPlacements.map((placement) => (
          <GapPlacementZone
            key={`gap-${placement.key()}`}
            barricade={placement}
            isPreview={previewBarricade?.equals(placement) ?? false}
            onHover={() => setPreviewBarricade(placement)}
            onPlace={() => handlePlaceBarricade(placement)}
          />
        ))}
      </div>

      {!isOver && (
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

      {isOver && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-zinc-900 px-8 py-6 ring-1 ring-zinc-700">
          <p className="text-xl font-semibold">
            {isDraw ? (
              "Draw — opponent is completely blocked!"
            ) : (
              <>
                <span
                  className={winner === 1 ? "text-blue-400" : "text-rose-400"}
                >
                  Player {winner}
                </span>{" "}
                wins!
              </>
            )}
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

function PlacedBarricade({ barricade }: { barricade: Barricade }) {
  const isHorizontal = barricade.orientation === "horizontal";

  return (
    <div
      style={gapGridStyle(barricade)}
      className="pointer-events-none z-10 flex items-center justify-center"
      aria-hidden
    >
      <div
        className={[
          "rounded-sm bg-amber-500 shadow-md shadow-amber-500/30",
          isHorizontal ? "h-full w-full" : "h-full w-full",
        ].join(" ")}
      />
    </div>
  );
}

function GapPlacementZone({
  barricade,
  isPreview,
  onHover,
  onPlace,
}: {
  barricade: Barricade;
  isPreview: boolean;
  onHover: () => void;
  onPlace: () => void;
}) {
  return (
    <button
      type="button"
      style={gapGridStyle(barricade)}
      className={[
        "z-20 flex cursor-pointer items-center justify-center rounded-sm transition-colors",
        isPreview
          ? "bg-amber-400/70 ring-1 ring-amber-300"
          : "bg-transparent hover:bg-amber-400/25",
      ].join(" ")}
      onMouseEnter={onHover}
      onClick={onPlace}
      aria-label={
        barricade.orientation === "horizontal"
          ? "Place horizontal barricade"
          : "Place vertical barricade"
      }
    />
  );
}

function PlayerBadge({
  player,
  active,
  barricadesRemaining,
}: {
  player: Player;
  active: boolean;
  barricadesRemaining: number;
}) {
  return (
    <div
      className={[
        "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition",
        player === 1 ? "bg-blue-500/10 text-blue-300" : "bg-rose-500/10 text-rose-300",
        active && (player === 1 ? "ring-2 ring-blue-400" : "ring-2 ring-rose-400"),
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className={[
            "h-3 w-3 rounded-full",
            player === 1 ? "bg-blue-500" : "bg-rose-500",
          ].join(" ")}
        />
        Player {player}
        {active && <span className="text-xs opacity-70">(turn)</span>}
      </div>
      <span className="text-xs opacity-70">
        {barricadesRemaining} barricades left
      </span>
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
