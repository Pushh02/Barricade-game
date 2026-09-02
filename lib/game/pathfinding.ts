import type { Barricade } from "./barricade-piece";
import { GRID_SIZE } from "./constants";
import { Position } from "./position";

const NEIGHBOR_DELTAS = [
  Position.delta(-1, 0),
  Position.delta(1, 0),
  Position.delta(0, -1),
  Position.delta(0, 1),
] as const;

export function isMoveBlockedByBarricades(
  from: Position,
  to: Position,
  barricades: Barricade[]
): boolean {
  if (to.row < from.row) {
    return barricades.some((b) => b.blocksVerticalCrossing(to.row, from.col));
  }
  if (to.row > from.row) {
    return barricades.some((b) => b.blocksVerticalCrossing(from.row, from.col));
  }
  if (to.col < from.col) {
    return barricades.some((b) => b.blocksHorizontalCrossing(to.col, from.row));
  }
  if (to.col > from.col) {
    return barricades.some((b) => b.blocksHorizontalCrossing(from.col, from.row));
  }
  return false;
}

export function getUnblockedNeighbors(
  pos: Position,
  barricades: Barricade[]
): Position[] {
  const neighbors: Position[] = [];

  for (const delta of NEIGHBOR_DELTAS) {
    const next = pos.add(delta);
    if (!next.isInBounds()) continue;
    if (isMoveBlockedByBarricades(pos, next, barricades)) continue;
    neighbors.push(next);
  }

  return neighbors;
}

/** BFS: can we reach any cell on goalRow from start, ignoring pieces? */
export function hasPathToGoal(
  start: Position,
  goalRow: number,
  barricades: Barricade[]
): boolean {
  if (start.row === goalRow) return true;

  const queue: Position[] = [start];
  const visited = new Set<string>([`${start.row},${start.col}`]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const next of getUnblockedNeighbors(current, barricades)) {
      if (next.row === goalRow) return true;

      const key = `${next.row},${next.col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push(next);
    }
  }

  return false;
}

export function bothPlayersHavePathToGoal(
  p1Position: Position,
  p2Position: Position,
  barricades: Barricade[]
): boolean {
  const p1Ok = hasPathToGoal(p1Position, 0, barricades);
  const p2Ok = hasPathToGoal(p2Position, GRID_SIZE - 1, barricades);
  return p1Ok && p2Ok;
}
