import { compareAsc, differenceInMilliseconds } from 'date-fns';
import { BodyAnalysis } from '../body-analysis.types';

export type InterpolatedWeight = {
  analysedAt: Date;
  weight: number;
};

export class BodyAnalysisDataInterpolation {
  private data: BodyAnalysis[];

  constructor(data: BodyAnalysis[]) {
    this.data = data.sort((a, b) => compareAsc(a.analysedAt, b.analysedAt));
  }

  private findSurroundingEntries(x: Date): {
    previous: BodyAnalysis | undefined;
    next: BodyAnalysis | undefined;
  } {
    const maxDateValue = Math.abs(new Date(0, 0, 0).valueOf());

    let bestPreviousIndex = -1;
    let bestNextIndex = -1;

    let bestPrevDiff = maxDateValue;
    let bestNextDiff = -maxDateValue;

    for (const [i, candidate] of this.data.entries()) {
      const diff = differenceInMilliseconds(x, candidate.analysedAt);

      if (diff < 0 && diff > bestNextDiff) {
        bestNextIndex = i;
        bestNextDiff = diff;
      }

      if (diff > 0 && diff < bestPrevDiff) {
        bestPreviousIndex = i;
        bestPrevDiff = diff;
      }
    }

    return {
      previous:
        bestPreviousIndex === -1 ? undefined : this.data.at(bestPreviousIndex),
      next: bestNextIndex === -1 ? undefined : this.data.at(bestNextIndex),
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
