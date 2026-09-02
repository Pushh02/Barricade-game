import { BARRICADE_SPAN, GRID_SIZE } from "./constants";
import type { BarricadeData, BarricadeOrientation } from "./types";

export class Barricade {
  constructor(
    readonly orientation: BarricadeOrientation,
    readonly edgeIndex: number,
    readonly startIndex: number
  ) {}

  overlaps(other: Barricade): boolean {
    if (this.orientation !== other.orientation) return false;
    if (this.edgeIndex !== other.edgeIndex) return false;

    const aStart = this.startIndex;
    const aEnd = this.startIndex + BARRICADE_SPAN - 1;
    const bStart = other.startIndex;
    const bEnd = other.startIndex + BARRICADE_SPAN - 1;

    return aStart <= bEnd && bStart <= aEnd;
  }

  equals(other: Barricade): boolean {
    return (
      this.orientation === other.orientation &&
      this.edgeIndex === other.edgeIndex &&
      this.startIndex === other.startIndex
    );
  }

  isInBounds(): boolean {
    const maxEdge = GRID_SIZE - 2;
    const maxStart = GRID_SIZE - BARRICADE_SPAN;
    return (
      this.edgeIndex >= 0 &&
      this.edgeIndex <= maxEdge &&
      this.startIndex >= 0 &&
      this.startIndex <= maxStart
    );
  }

  blocksVerticalCrossing(edgeRow: number, col: number): boolean {
    if (this.orientation !== "horizontal") return false;
    if (this.edgeIndex !== edgeRow) return false;
    return col >= this.startIndex && col < this.startIndex + BARRICADE_SPAN;
  }

  blocksHorizontalCrossing(edgeCol: number, row: number): boolean {
    if (this.orientation !== "vertical") return false;
    if (this.edgeIndex !== edgeCol) return false;
    return row >= this.startIndex && row < this.startIndex + BARRICADE_SPAN;
  }

  toJSON(): BarricadeData {
    return {
      orientation: this.orientation,
      edgeIndex: this.edgeIndex,
      startIndex: this.startIndex,
    };
  }

  static from(data: BarricadeData): Barricade {
    return new Barricade(data.orientation, data.edgeIndex, data.startIndex);
  }

  /** CSS grid placement for the gap slot this barricade occupies. */
  getGapGridPlacement(): {
    gridRow: number;
    gridColumn: number;
    rowSpan: number;
    colSpan: number;
  } {
    if (this.orientation === "horizontal") {
      return {
        gridRow: this.edgeIndex * 2 + 2,
        gridColumn: this.startIndex * 2 + 1,
        rowSpan: 1,
        colSpan: 3,
      };
    }

    return {
      gridRow: this.startIndex * 2 + 1,
      gridColumn: this.edgeIndex * 2 + 2,
      rowSpan: 3,
      colSpan: 1,
    };
  }

  key(): string {
    return `${this.orientation}-${this.edgeIndex}-${this.startIndex}`;
  }
}
