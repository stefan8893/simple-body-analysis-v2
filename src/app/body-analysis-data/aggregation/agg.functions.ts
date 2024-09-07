import {
  addWeeks,
  compareAsc,
  differenceInCalendarDays,
  differenceInCalendarISOWeeks,
  endOfISOWeek,
  startOfDay,
  startOfISOWeek,
} from 'date-fns';
import { BodyAnalysis, BodyAnalysisProperty } from '../body-analysis.types';
import { BodyAnalysisDataInterpolation } from './body-analysis-data-interpolation';
import { BodyAnalysisWeekly, WidgetValues } from './data.types';

export const nullWidgetValues = {
  selectedDateRangeFrom: null,
  selectedDateRangeTo: null,
  latestValue: null,
  lossGainInSelectedDateRange: null,
  averageWeeklyLossGain: null,
};

export function calculateWidgetValues(
  bodyAnalysisData: BodyAnalysis[],
  property: BodyAnalysisProperty
): WidgetValues {
  if (bodyAnalysisData.length === 0) return nullWidgetValues;

  return {
    selectedDateRangeFrom: bodyAnalysisData[0].analysedAt,
    selectedDateRangeTo:
      bodyAnalysisData[bodyAnalysisData.length - 1].analysedAt,
    latestValue: bodyAnalysisData[bodyAnalysisData.length - 1][property],
    lossGainInSelectedDateRange:
      bodyAnalysisData[bodyAnalysisData.length - 1][property] -
      bodyAnalysisData[0][property],
    averageWeeklyLossGain: calculateAverageWeeklyLossGain(
      bodyAnalysisData,
      property
    ),
  };
}

function calculateAverageWeeklyLossGain(
  bodyAnalysisData: BodyAnalysis[],
  property: BodyAnalysisProperty
): number | null {
  if (bodyAnalysisData.length < 2) return null;

  const first = bodyAnalysisData.at(0)!;
  const last = bodyAnalysisData.at(-1)!;

  const timespanInDays = differenceInCalendarDays(
    first.analysedAt,
    last.analysedAt
  );

  const differencesBetweenDays = bodyAnalysisData
    .slice(1)
    .map((x, i) => x[property] - bodyAnalysisData[i][property]);

  const sumOfDifferences = differencesBetweenDays.reduce(
    (acc, next) => acc + next,
    0
  );

  return Math.abs(sumOfDifferences / (timespanInDays / 7.0));
}

export function calculateWeekDifferences(
  data: BodyAnalysis[]
): BodyAnalysisWeekly[] {
  if (data.length < 2) return [];

  const firstEntry = data[0];
  const firstWeek = startOfISOWeek(firstEntry.analysedAt);
  const lastEntry = data[data.length - 1];

  const weeksInBetween = differenceInCalendarISOWeeks(
    lastEntry.analysedAt,
    firstEntry.analysedAt
  );

  if (weeksInBetween <= 0) return [];

  const interpolation = new BodyAnalysisDataInterpolation(data);

  const result = Array.from({ length: weeksInBetween }, (x, i) => i)
    .map((x, i) => ({
      startOfWeek: startOfISOWeek(addWeeks(firstWeek, i)),
      endOfWeek: endOfISOWeek(addWeeks(firstWeek, i)),
    }))
    .map(({ startOfWeek, endOfWeek }) => ({
      first: interpolation.at(startOfWeek),
      last: interpolation.at(endOfWeek),
    }))
    .filter(({ first, last }) => !!first?.analysedAt && !!last?.analysedAt)
    .filter(({ first, last }) => !!first?.weight && !!last?.weight)
    .filter(
      ({ first, last }) => compareAsc(first!.analysedAt, last!.analysedAt) <= 0
    )
    .map(({ first, last }) => ({
      firstDayOfWeek: startOfDay(first!.analysedAt),
      weightDiff: last!.weight - first!.weight,
    }));

  return result;
}
