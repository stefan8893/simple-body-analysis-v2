import {
  addWeeks,
  differenceInCalendarDays,
  differenceInCalendarISOWeeks,
  endOfISOWeek,
  format,
  startOfDay,
  startOfISOWeek,
} from 'date-fns';
import { de } from 'date-fns/locale';
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
    averageWeeklyLossGain: calculateAverageWeekDifferences(
      bodyAnalysisData,
      property
    ),
  };
}

function calculateAverageWeekDifferences(
  bodyAnalysisData: BodyAnalysis[],
  property: BodyAnalysisProperty
): number | null {
  if (bodyAnalysisData.length < 2) return null;

  const oneEntryPerDayGrouping = Object.entries(
    Object.groupBy(bodyAnalysisData, ({ analysedAt }) =>
      format(analysedAt, 'P', { locale: de })
    )
  );

  const oneEntryPerDay = oneEntryPerDayGrouping
    .map(([, v]) => v?.at(-1))
    .filter((x) => !!x);

  if (oneEntryPerDay.length < 2) return null;

  const first = oneEntryPerDay.at(0)!;
  const last = oneEntryPerDay.at(-1)!;

  const timespanInDays = differenceInCalendarDays(
    last.analysedAt,
    first.analysedAt
  );

  const differencesBetweenDays = oneEntryPerDay
    .slice(1)
    .map((x, i) => x[property] - oneEntryPerDay[i][property]);

  const sumOfDifferences = differencesBetweenDays.reduce(
    (acc, next) => acc + next,
    0
  );

  return Math.abs(sumOfDifferences / (timespanInDays / 7.0));
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
  const result = Array.from(
    { length: weeksInBetweenIncludingCurrentWeek },
    (x, i) => i
  )
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

  return result;
}
