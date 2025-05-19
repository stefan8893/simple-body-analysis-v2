import {
  addWeeks,
  differenceInCalendarDays,
  differenceInCalendarISOWeeks,
  endOfISOWeek,
  startOfDay,
  startOfISOWeek,
} from 'date-fns';
import { BodyAnalysis, BodyAnalysisProperty } from '../body-analysis.types';
import { BodyAnalysisDataInterpolation } from './body-analysis-data-interpolation';
import { BodyAnalysisWeeklyDiff, WidgetValues } from './data.types';

export const nullWidgetValues = {
  selectedDateRangeFrom: null,
  selectedDateRangeTo: null,
  latestValue: null,
  lossGainInSelectedDateRange: null,
  averageWeeklyLossGain: null,
};

const daysToCalculateAverage = 3;

export function calculateWidgetValues(
  bodyAnalysisData: BodyAnalysis[],
  property: BodyAnalysisProperty
): WidgetValues {
  if (bodyAnalysisData.length < daysToCalculateAverage) return nullWidgetValues;

  const averageOfFirstNDays = +(
    bodyAnalysisData
      .slice(0, daysToCalculateAverage)
      .reduce((acc, next) => acc + next[property], 0) / daysToCalculateAverage
  ).toFixed(2);

  return {
    selectedDateRangeFrom: bodyAnalysisData[0].analysedAt,
    selectedDateRangeTo:
      bodyAnalysisData[bodyAnalysisData.length - 1].analysedAt,
    latestValue: bodyAnalysisData[bodyAnalysisData.length - 1][property],
    lossGainInSelectedDateRange:
      bodyAnalysisData[bodyAnalysisData.length - 1][property] -
      averageOfFirstNDays,
    averageWeeklyLossGain: calculateAverageWeekDifferences(
      averageOfFirstNDays,
      bodyAnalysisData,
      property
    ),
  };
}

function calculateAverageWeekDifferences(
  averageOfFirstThreeDays: number,
  bodyAnalysisData: BodyAnalysis[],
  property: BodyAnalysisProperty
): number | null {
  const first = bodyAnalysisData[0];
  const last = bodyAnalysisData[bodyAnalysisData.length - 1];

  const timespanInDays = differenceInCalendarDays(
    last.analysedAt,
    first.analysedAt
  );

  const difference = last[property] - averageOfFirstThreeDays;

  return Math.abs(difference / (timespanInDays / 7.0));
}

export function calculateWeekDifferences(
  data: BodyAnalysis[]
): BodyAnalysisWeeklyDiff[] {
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
  const weeksInBetweenIncludingCurrentWeek = weeksInBetween + 1;

  return Array.from({ length: weeksInBetweenIncludingCurrentWeek }, (x, i) => i)
    .map((x) => ({
      startOfWeek: startOfISOWeek(addWeeks(firstWeek, x)),
      endOfWeek: endOfISOWeek(addWeeks(firstWeek, x)),
    }))
    .map(({ startOfWeek, endOfWeek }) => ({
      first: interpolation.at(startOfWeek),
      last: interpolation.at(endOfWeek),
    }))
    .filter(({ first, last }) => !!first?.analysedAt && !!last?.analysedAt)
    .filter(({ first, last }) => !!first?.weight && !!last?.weight)
    .map(({ first, last }) => ({
      firstDayOfWeek: startOfDay(first!.analysedAt),
      weightDiff: last!.weight - first!.weight,
    }));
}
