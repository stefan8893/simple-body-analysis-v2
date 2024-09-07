import { compareAsc } from 'date-fns';
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
    const previous = this.data.filter((y) => y.analysedAt <= x).at(-1);
    const next = this.data.filter((y) => y.analysedAt >= x).at(0);

    return { previous, next };
  }

  at(x: Date): InterpolatedWeight | null {
    const { previous, next } = this.findSurroundingEntries(x);

    if (!previous || !next) return null;

    // k * x + d
    const x0 = previous.analysedAt.getTime();
    const y0 = previous.weight;
    const x1 = next.analysedAt.getTime();
    const y1 = next.weight;

    const k = Math.abs((y1 - y0) / (x1 - x0));
    const y = k * (x.getTime() - x0) + Math.min(y0, y1);

    return {
      analysedAt: x,
      weight: y,
    };
  }
}
