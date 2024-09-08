import { compareAsc } from 'date-fns';
import { BodyAnalysis } from '../body-analysis.types';

export type InterpolatedWeight = {
  analysedAt: Date;
  weight: number;
};

type SearchMode = 'previous-if-no-exact-match' | 'next-if-no-exact-match';

export class BodyAnalysisDataInterpolation {
  private data: BodyAnalysis[];

  constructor(data: BodyAnalysis[]) {
    this.data = data.sort((a, b) => compareAsc(a.analysedAt, b.analysedAt));
  }

  binarySearch(
    mode: SearchMode,
    target: Date,
    low = 0,
    high = this.data.length - 1
  ): BodyAnalysis {
    if (target < this.data[low].analysedAt) {
      return this.data[0];
    }

    if (target > this.data[high].analysedAt) {
      return this.data[high];
    }

    const middle = Math.floor((high + low) / 2);

    return high - low < 2
      ? mode === 'previous-if-no-exact-match'
        ? this.data[low]
        : this.data[high]
      : target < this.data[middle].analysedAt
      ? this.binarySearch(mode, target, low, middle)
      : target > this.data[middle].analysedAt
      ? this.binarySearch(mode, target, middle, high)
      : this.data[middle];
  }

  private findSurroundingEntries(x: Date): {
    previous: BodyAnalysis | undefined;
    next: BodyAnalysis | undefined;
  } {
    return {
      previous: this.binarySearch('previous-if-no-exact-match', x),
      next: this.binarySearch('next-if-no-exact-match', x),
    };
  }

  at(analysedAt: Date): InterpolatedWeight | null {
    const { previous, next } = this.findSurroundingEntries(analysedAt);

    if (!previous || !next) return null;

    const x0 = previous.analysedAt.getTime();
    const y0 = previous.weight;
    const x1 = next.analysedAt.getTime();
    const y1 = next.weight;

    // y = k * x + d
    const k = Math.abs((y1 - y0) / (x1 - x0));
    const x = analysedAt.getTime() - x0;
    const d = Math.min(y0, y1);

    const y = k * x + d;

    return {
      analysedAt: analysedAt,
      weight: y,
    };
  }
}
